// cartController.js
import { CART } from '../models/cartModel.js';
import { ITEMS } from '../models/itemsModel.js';

// Add item to cart
export const addItemToCart = async (req, res) => {
  console.log("aditm cart");
  
  try {
    const { user_id, restaurant_id, item_id } = req.body;
    console.log(req.body,"bodyinadd");
    

    // Check if user already has a cart
    let userCart = await CART.findOne({ user: user_id });

    // If cart exists, check restaurant
    if (userCart) {
      // If cart has items from different restaurant
      if (userCart.restaurant_id && userCart.restaurant_id.toString() !== restaurant_id.toString()) {
        return res.status(400).json({
          success: false,
          message: "You have items from another restaurant in your cart. Please clear your cart first."
        });
      }
    }

    // Get item details for price
    const item = await ITEMS.findById(item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    if (userCart) {
      // Check if item already exists in cart
      const existingItemIndex = userCart.items.findIndex(
        cartItem => cartItem.item.toString() === item_id
      );

      if (existingItemIndex > -1) {
        // Increase quantity if item exists
        userCart.items[existingItemIndex].quantity += 1;
      } else {
        // Add new item if it doesn't exist
        userCart.items.push({
          item: item_id,
          quantity: 1
        });
      }

      // Update restaurant_id if not set
      if (!userCart.restaurant_id) {
        userCart.restaurant_id = restaurant_id;
      }

      // Recalculate total price
      userCart.totalPrice = userCart.items.reduce((total, cartItem) => {
        return total + (item.price * cartItem.quantity);
      }, 0);

      await userCart.save();
    } else {
      // Create new cart if doesn't exist
      userCart = await CART.create({
        user: user_id,
        restaurant_id: restaurant_id,
        items: [{
          item: item_id,
          quantity: 1
        }],
        totalPrice: item.price
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      data: userCart
    });

  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error adding item to cart",
      error: error.message
    });
  }
};

// Get user's cart
export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find cart and populate related data
    const cart = await CART.findOne({ user: userId })
      .populate('items.item')
      .populate('restaurant_id');
    
    return res.status(200).json({
      success: true,
      data: cart,
      
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: error.message
    });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;  // Fixed variable name
    const { userId, quantity } = req.body;
    console.log(req.body, req.params, "in update cart");

    const cart = await CART.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    console.log(cart);

    // Find item in cart
    const cartItem = cart.items.find(item => item._id.toString() === itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart"
      });
    }

    // Update quantity
    cartItem.quantity = quantity;

    // Fetch item details to get price
    const itemDetails = await ITEMS.findById(cartItem.item);
    if (!itemDetails) {
      return res.status(404).json({
        success: false,
        message: "Item details not found"
      });
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, cartItem) => {
      return total + (cartItem.quantity * itemDetails.price); // Fetching price from DB
    }, 0);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart
    });

  } catch (error) {
    console.error("Update cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating cart",
      error: error.message
    });
  }
};


// Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { userId } = req.body;

    const cart = await CART.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    // Remove item
    cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);

    // If cart is empty, remove restaurant_id
    if (cart.items.length === 0) {
      cart.restaurant_id = null;
      cart.totalPrice = 0;
    } else {
      // Recalculate total price
      const itemsWithDetails = await Promise.all(
        cart.items.map(async (item) => {
          const itemDetails = await ITEMS.findById(item.item);
          return {
            ...item.toObject(),
            price: itemDetails.price
          };
        })
      );

      cart.totalPrice = itemsWithDetails.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });

  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message
    });
  }
};
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;// Get user ID from request body

    // Find the user's cart
    const cart = await CART.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear all items from the cart
    cart.items = [];
    cart.restaurant_id = null;  // Reset restaurant ID
    cart.totalPrice = 0;        // Reset total price

    await cart.save(); // Save the updated cart

    return res.status(200).json({
      success: true,
      message: "Cart has been cleared successfully",
      data: cart,
    });

  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};
