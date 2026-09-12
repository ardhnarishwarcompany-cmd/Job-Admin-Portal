import { CompanyModel } from "./dbModels.js";

export class Company {
  static findById(id) {
    return CompanyModel.findById(id);
  }

  static findOne(filter) {
    // Support finding by name
    if (filter && filter.name) {
      return CompanyModel.findOneByName(filter.name);
    }
    // Support finding by id
    if (filter && filter._id) {
      return CompanyModel.findById(filter._id);
    }
    // Support finding by other fields
    return null;
  }

  static find({ userId }) {
    return CompanyModel.findByUserId(userId);
  }

  static create(data) {
    return CompanyModel.create(data);
  }

  static async findByIdAndUpdate(id, updateData, options = {}) {
    // Update the company
    await CompanyModel.updateById(id, updateData);
    
    // Return the updated document
    return CompanyModel.findById(id);
  }
}

