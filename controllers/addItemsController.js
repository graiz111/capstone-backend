import { ITEMS } from "../models/itemsModel.js";
import { RESTAURANT } from "../models/restaurantModel.js";


export const addItemToRestaurant = async (req, res) => {
  try {
    const {name, price, description} = req.body;
    const{id}=req.restaurant
    console.log(req.body)
    console.log(req.restaurant);
    

   
    const restaurant = await RESTAURANT.findById(id);
    console.log(restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }
    const itemPicUrl = req.cloudinaryResult.secure_url;
    if (!itemPicUrl) {
      return res.status(400).json({ message: "File upload failed." });
    }

   
    const newItem = new ITEMS({
      restaurant_id: id,
      name,
      price,
      description,
      itemPic:itemPicUrl,
    });

   
    const savedItem = await newItem.save();

    restaurant.items.push(savedItem._id);
    await restaurant.save();

    res.status(201).json({ message: "Item added successfully.", data: savedItem });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Internal br  server error." });
  }
};
export const getItemsByRestaurant = async (req, res) => {
  try {
    console.log("Entered getAllItems of restaurant");

    const {_id} = req.params; 
    console.log("Restaurant ID:", _id);

    const items = await ITEMS.find({ restaurant_id: _id });
    console.log("Fetched Items:", items);

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "No items found for this restaurant." });
    }

    res.status(200).json({ message: "Items fetched successfully.", data: items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getItemsall = async (req, res) => {
  try {
    
      

      const items = await ITEMS.find();
      
      

      if (!items || items.length === 0) {
          return res.status(404).json({ message: "No items found for this restaurant." });
      }

      res.status(200).json({ message: "Items fetched successfully.", data: items });
  } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Internal server error." });
  }
};
export const getRestaurantByItemId = async (req, res) => {
  try {
    console.log("Entered add to cart fetchres");

    const { itemId } = req.body; // Extract item ID from request body

    // Find the item by ID and select only the restaurant_id
    const item = await ITEMS.findById(itemId).select("restaurant_id");

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    const restaurantId = item.restaurant_id.toString(); // Convert ObjectId to string

    console.log("Restaurant ID:", restaurantId);

    res.status(200).json({ 
      message: "Restaurant ID fetched successfully.", 
      restaurant_id: restaurantId, 
      success: true 
    });

  } catch (error) {
    console.error("Error fetching restaurant ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const deleteItemFromRestaurant = async (req, res) => {
  console.log('enterede delee items');
  
  try {
    const {item_id} = req.params;
    const {id} = req.restaurant;
    console.log(item_id,id);
    

    const deletedItem = await ITEMS.findOneAndDelete({
      _id: item_id,
      restaurant_id:id,  
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found or does not belong to this restaurant." });
    }

    res.status(200).json({ message: "Item deleted successfully.", data: deletedItem });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateItem = async (req, res) => {
  console.log("entered update item ");
  
  try {
    const { item_id } = req.params;
    const { name, price, description } = req.body;
    const itemPicUrl = req.cloudinaryResult?.secure_url; 

    const updateData = { name, price, description };
    if (itemPicUrl) {
      updateData.itemPic = itemPicUrl; 
    }

    const updatedItem = await ITEMS.findOneAndUpdate(
      { _id: item_id },
      updateData,
      { new: true } 
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found or does not belong to this restaurant." });
    }

    res.status(200).json({ message: "Item updated successfully.", data: updatedItem ,success:true});
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


  
