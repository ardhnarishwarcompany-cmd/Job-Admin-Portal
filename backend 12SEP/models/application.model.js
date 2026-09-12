import { ApplicationModel } from "./dbModels.js";

export class Application {
  // Check if a user already applied to a job
  static findOne({ job, applicant } = {}) {
    if (job !== undefined && applicant !== undefined) {
      return ApplicationModel.findByJobAndApplicant(job, applicant);
    }
    // Fallback — not needed but prevents crash
    return Promise.resolve(null);
  }

  static create(data) {
    return ApplicationModel.create(data);
  }

  static find(query = {}) {
    if (query.applicant !== undefined) return ApplicationModel.findByApplicant(query.applicant);
    return ApplicationModel.findAll();
  }

  static countDocuments() {
    return ApplicationModel.count();
  }

  static findByRecruiter(recruiterId) {
    return ApplicationModel.findByRecruiter(recruiterId);
  }

  static async updateStatus(applicationId, status) {
    return ApplicationModel.updateStatus(applicationId, status);
  }

  static async requestInterview(data) {
    return ApplicationModel.requestInterview(data);
  }

  static async updateInterviewStatusForRecruiter(data) {
    return ApplicationModel.updateInterviewStatusForRecruiter(data);
  }
}
