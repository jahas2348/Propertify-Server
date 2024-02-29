const mongoose = require('mongoose');
const PropertyModel = require('../models/propertyModel');
const CategoryModel = require('../models/categoryModel');
const AgentModel = require('../models/agentModel');
const dotenv = require('dotenv'); // Import dotenv
dotenv.config();
// Retrieve BASE_URL from environment variables
const BASE_URL = process.env.BASE_URL;

// Add Property Data
const addPropertyData = async (req, res) => {
  try {

    let propertyCoverPicture = null;
    if (req.files['propertyCoverPicture'] && req.files['propertyCoverPicture'][0]) {
      propertyCoverPicture = req.files['propertyCoverPicture'][0].filename;
    }
    const propertyGalleryPictures = [];
    if (req.files['propertyGalleryPictures']) {
      for (let i = 0; i < req.files['propertyGalleryPictures'].length; i++) {
        propertyGalleryPictures.push(req.files['propertyGalleryPictures'][i].filename);
      }
    }
    // Fetch data
    const {
      agent,
      propertyName,
      propertyRooms,
      propertyBathrooms,
      propertySqft,
      propertyPrice,
      propertyCategory,
      propertyCity,
      propertyState,
      propertyZip,
      propertyDescription,
      longitude,
      latitude,
      amenities,
      isApproved,
      tags,
    } = req.body;

    // Process amenities
    const amenitiesArray = [];
    if (amenities && amenities.length > 0) {
      for (let i = 0; i < amenities.length; i++) {
        amenitiesArray.push(amenities[i]);
      }
    }

    const existingCategory = await CategoryModel.findOne({ categoryName: propertyCategory });

    if (!existingCategory) {
      return res.status(400).json({ message: 'Category does not exist' });
    }

    const propertyCategoryObjectId = existingCategory._id;

    // Add Property Data
    const addPropertyData = new PropertyModel({
      agent,
      propertyName,
      propertyRooms,
      propertyBathrooms,
      propertySqft,
      propertyPrice,
      propertyCategory: propertyCategoryObjectId,
      propertyCity,
      propertyState,
      propertyZip,
      propertyDescription,
      longitude,
      latitude,
      amenities: amenitiesArray,
      isApproved,
      propertyCoverPicture,
      propertyGalleryPictures,
      tags,
    });

    const propertyData = await addPropertyData.save();

    res.status(200).json({ status: "Success", message: 'Property added successfully', propertyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Delete Property by ID
const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const property = await PropertyModel.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    await PropertyModel.findByIdAndDelete(propertyId);
    res.status(200).json({ status: "success", message: "Property Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const {
      propertyName,
      propertyRooms,
      propertyBathrooms,
      propertySqft,
      propertyPrice,
      propertyCategory,
      propertyCity,
      propertyState,
      propertyZip,
      propertyDescription,
      longitude,
      latitude,
      amenities,
      isApproved,
      tags,
    } = req.body;

    const { updatedCoverPicture, newGalleryPictures } = req.files;
    const removedImageUrls = req.body.removedImageUrls; // Assuming removedImageUrls is sent as an array of strings in the request body
    
    console.log("New Gallery Pictures:", newGalleryPictures);
    console.log("Updated Cover Picture:", updatedCoverPicture);
    console.log("Removed Gallery Pictures:", removedImageUrls);

    const category = await CategoryModel.findOne({ categoryName: propertyCategory });

    if (!category) {
      return res.status(400).json({ status: "error", message: "Category not found" });
    }

    const propertyCategoryObjectId = category._id;

    // Retrieve existing property data from the database
    const existingProperty = await PropertyModel.findById(propertyId);

    // Handle removed gallery pictures
    let propertyGalleryPictures = existingProperty.propertyGalleryPictures;
    if (removedImageUrls && removedImageUrls.length > 0) {
      console.log("Existing Gallery Pictures:", propertyGalleryPictures);
      // Remove the images based on the provided URLs
      propertyGalleryPictures = propertyGalleryPictures.filter((picture) => {
        return !removedImageUrls.includes(picture); // Assuming the URLs in removedImageUrls don't have the base URL prefix
      });
      console.log("Updated Gallery Pictures after removal:", propertyGalleryPictures);
    }

    // Handle new gallery pictures
    if (newGalleryPictures && newGalleryPictures.length > 0) {
      // Calculate the remaining slots for new pictures
      const remainingSlots = 4 - propertyGalleryPictures.length;
      const newPicturesToAdd = newGalleryPictures.slice(0, remainingSlots).map(file => file.filename);
      
      // Add new pictures to the propertyGalleryPictures array
      propertyGalleryPictures = [...propertyGalleryPictures, ...newPicturesToAdd];
    }
    console.log("New Gallery Pictures:", propertyGalleryPictures);

    const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities]; // Ensure amenities is an array

    const updates = {
      $set: {
        propertyName,
        propertyRooms,
        propertyBathrooms,
        propertySqft,
        propertyPrice,
        propertyCategory: propertyCategoryObjectId,
        propertyCity,
        propertyState,
        propertyZip,
        propertyDescription,
        longitude,
        latitude,
        amenities: amenitiesArray,
        isApproved,
        propertyGalleryPictures,
        propertyCoverPicture: updatedCoverPicture ? updatedCoverPicture[0].filename : existingProperty.propertyCoverPicture, // Use existing cover picture if not updated
        tags,
      },
    };

    await PropertyModel.findByIdAndUpdate(propertyId, updates);

    res.status(200).json({ status: "success", message: "Property Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};





const getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.find({})
      .populate('agent')
      .populate('propertyCategory', 'categoryName');

    if (properties) {
      const modifiedProperties = properties.map((property) => {
        const propertyData = property.toObject();
        propertyData.propertyCategory = property.propertyCategory.categoryName;
        propertyData.agent = property.agent;
        // Format date and time in Indian format (date-time AM/PM)
        const formattedDateTime = new Date(propertyData.createdAt).toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).replace(/ /g, '-');

        // Construct full URLs for propertyCoverPicture and propertyGalleryPictures
        propertyData.propertyCoverPicture = `${BASE_URL}/public/uploads/${property.propertyCoverPicture}`;
        propertyData.propertyGalleryPictures = propertyData.propertyGalleryPictures.map((picture) => {
          return `${BASE_URL}/public/uploads/${picture}`;
        });

        return propertyData;
      });

      console.log('Successfully retrieved properties');
      console.log(modifiedProperties);
      res.json({ status: 'success', properties: modifiedProperties });
    } else {
      res.json({ status: 'success', properties: [] });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};



// Add Category
const addCategory = async (req, res) => {
  try {
    const { categoryName, categoryDescription } = req.body;
    const createcategory = new CategoryModel({ categoryName, categoryDescription });
    const category = await createcategory.save();
    res.json({ status: 'success', message: 'Category Added Successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Approve Property
const approveProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const newIsApprovedStatus = req.body.isApproved;

    // Update the isApproved status of the property
    await PropertyModel.findByIdAndUpdate(propertyId, { $set: { isApproved: newIsApprovedStatus } });

    res.status(200).json({ status: "success", message: "Property status updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Approve Property
const rejectProperty = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const newIsApprovedStatus = req.body.isRejected;

    // Update the isApproved status of the property
    await PropertyModel.findByIdAndUpdate(propertyId, { $set: { isRejected: newIsApprovedStatus } });

    res.status(200).json({ status: "success", message: "Property Rejected successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get All Agents
const getAllAgents = async (req, res) => {
  try {
    // Fetch all agents from the database
    const agents = await AgentModel.find({});
    
    // Check if any agents were found
    if (agents.length > 0) {
      res.status(200).json({ status: 'success', agents });
    } else {
      res.status(200).json({ status: 'success', message: 'No agents found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

module.exports = { addPropertyData, getAllProperties, deleteProperty, updateProperty, addCategory, approveProperty, rejectProperty, getAllAgents };

