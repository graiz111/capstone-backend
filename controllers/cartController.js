import { CART } from '../models/cartModel.js';
import { ITEMS } from '../models/itemsModel.js';

export const addItemToCart = async (req, res) => {
  
  
  try {
    const { user_id, restaurant_id, item_id } = req.body;
    let userCart = await CART.findOne({ user: user_id });

    if (userCart && userCart.items.length > 0 ) {
 
      if (userCart.restaurant_id && userCart.restaurant_id.toString() !== restaurant_id.toString()) {
   

        return res.status(400).json({
          success: false,
          message: "Add items from same restaurant"
        });
      }
    }

    const item = await ITEMS.findById(item_id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }
    if (userCart) {
      const existingItemIndex = userCart.items.findIndex(
        cartItem => cartItem.item.toString() === item_id
      );
      if (existingItemIndex > -1) {

        userCart.items[existingItemIndex].quantity += 1;
      } else {

        userCart.items.push({
          item: item_id,
          quantity: 1
        });
      }
      if (!userCart.restaurant_id) {
   

        userCart.restaurant_id = restaurant_id;
      }
  

      
      userCart.totalPrice = userCart.items.reduce((total, cartItem) => {
        return total + (item.price * cartItem.quantity);
      }, 0);

      await userCart.save();
    } else {
      

   
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



export const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    
    
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

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;  // Fixed variable name
    const { userId, quantity } = req.body;
   

    const cart = await CART.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found"
      });
    }

    (cart);

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

    cart.items = cart.items.filter(item => item._id.toString() !== cartItemId);

    if (cart.items.length === 0) {
      cart.restaurant_id = null;
      cart.totalPrice = 0;
    } else {
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
    const { userId } = req.params;

    const cart = await CART.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    cart.restaurant_id = null; 
    cart.totalPrice = 0;   

    await cart.save(); 

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
export const updateCartTotalPrice = async (req, res) => {
  try {
    const { cartId, amount } = req.body; // Get cartId and new total price from frontend

    if (!cartId || amount === undefined) {
      return res.status(400).json({ success: false, message: "Missing cartId or amount" });
    }

    // Update totalPrice in the cart model by cartId
    const updatedCart = await CART.findByIdAndUpdate(
      cartId,
      { totalPrice: amount },
      { new: true } // Return the updated document
    );

    if (!updatedCart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    res.json({ success: true, message: "Total price updated", cart: updatedCart });
  } catch (error) {
    console.error("Error updating total price:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
