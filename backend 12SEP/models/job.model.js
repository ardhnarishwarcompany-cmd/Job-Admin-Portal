import { JobModel } from "./dbModels.js";

export class Job {
  static create(data) {
    return JobModel.create(data);
  }

  static find(query) {
    // Handle getAllJobs query with keyword search
    if (query && query.$or) {
      const keyword = query.$or[0]?.title?.$regex || "";
      return JobModel.findAll(keyword);
    }
    return JobModel.findAll("");
  }

  static async findById(id) {
    const job = await JobModel.findById(id);
    return Job.fromRow(job);
  }

  static findByAdminId(adminId) {
    return JobModel.findByAdminId(adminId);
  }

  static findByApprovalStatus(status) {
    return JobModel.findByApprovalStatus(status);
  }

  static findAllAdmin() {
    return JobModel.findAllAdmin();
  }

  static findOne() {
    throw new Error("Not implemented");
  }

  static countDocuments() {
    return JobModel.count();
  }

  static async findByIdAndDelete(id) {
    return JobModel.deleteById(id);
  }

  static async updateById(id, patch) {
    return JobModel.updateById(id, patch);
  }

  static fromRow(row) {
    if (!row) return null;
    return {
      ...row,
      applications: row.applications || [],
      // mimic mongoose save
      save: async function () {
        const { id, ...rest } = this;
        return JobModel.updateById(id, rest);
      },
    };
  }
}

