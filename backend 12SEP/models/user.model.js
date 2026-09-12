import { UserModel } from "./dbModels.js";

export class User {
  static findOne({ email }) {
    return UserModel.findByEmail(email);
  }

  static async findByResetToken(token) {
    const user = await UserModel.findByResetToken(token);
    return User.fromRow(user);
  }

  static find(query) {
    return UserModel.find(query);
  }

  static countDocuments(query = {}) {
    return UserModel.count(query);
  }

  static async findById(id) {
    const user = await UserModel.findById(id);
    return User.fromRow(user);
  }

  static findByIdAndUpdate(id, patch) {
    return UserModel.updateById(id, patch);
  }

  static create(data) {
    // data comes from controllers currently using mongoose-style nesting.
    // Map controller payload into SQL columns.
    return UserModel.create({
      fullname: data.fullname,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      pancard: data.pancard,
      adharcard: data.adharcard,
      role: data.role,
      dateOfBirth: data.extraDetails?.dateOfBirth,
      companyName: data.extraDetails?.companyName,
      gstNumber: data.extraDetails?.gstNumber,
      adminCode: data.extraDetails?.adminCode,
      profilePhoto: data.profile?.profilePhoto || data.candidateProfile?.profilePhoto || data.recruiterProfile?.profilePhoto,
      resume: data.resume || data.candidateProfile?.resume || data.recruiterProfile?.resume,
      resumeOriginalName: data.resumeOriginalName || data.candidateProfile?.resumeOriginalName || data.recruiterProfile?.resumeOriginalName,
      bio: data.profile?.bio || data.candidateProfile?.personal?.bio,
      skills: data.profile?.skills || data.candidateProfile?.professional?.skills,
      city: data.profile?.city || data.candidateProfile?.personal?.city || data.recruiterProfile?.personal?.city,
      experience: data.profile?.experience || data.candidateProfile?.career?.experience,
      education: data.profile?.education || data.candidateProfile?.education?.degree,
      profileRole: data.profile?.role,
      candidateProfile: data.candidateProfile,
      recruiterProfile: data.recruiterProfile,
      verificationStatus: data.verificationStatus,
    });
  }

  // For updateProfile controller; we only need to support reading then patching.
  static async updateById(id, patch) {
    return UserModel.updateById(id, patch);
  }

  // Provide instance-like behavior expected by controllers (user.save())
  static fromRow(row) {
    if (!row) return null;
    return {
      ...row,
      save: async function () {
        return UserModel.updateById(row.id, this);
      },
    };
  }
}

