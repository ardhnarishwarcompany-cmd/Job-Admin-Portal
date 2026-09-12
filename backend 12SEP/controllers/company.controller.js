import { Company } from "../models/company.model.js";


export const registerCompany = async (req, res) => {
  try {
    console.log("registerCompany body:", req.body);
    const companyName = req.body?.companyName?.trim();
    if (!companyName) {
      return res.status(400).json({ message: "Company name is required", success: false });
    }
    let existing = await Company.findOne({ name: companyName });
    if (existing) {
      return res.status(401).json({ message: "Company already exists", success: false });
    }
    const row = await Company.create({ name: companyName, userId: req.id });
    const company = { ...row, _id: String(row.id || row._id), id: String(row.id || row._id) };
    return res.status(201).json({ message: "Company registered successfully.", company, success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const userId = req.id;
    const rows = await Company.find({ userId });
    const companies = (rows || []).map((c) => ({
      ...c,
      _id: String(c.id || c._id),
      id: String(c.id || c._id),
    }));
    return res.status(200).json({ companies, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//get company by id
export const getCompanyById = async (req, res) => {
  try {
    const companyId = req.params.id;
    const row = await Company.findById(companyId);
    if (!row) {
      return res.status(404).json({ message: "Company not found", success: false });
    }
    const company = { ...row, _id: String(row.id || row._id), id: String(row.id || row._id) };
    return res.status(200).json({ company, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//update company details
export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, location } = req.body;
    const file = req.file;

    const updateData = { name, description, website, location };
    if (file) {
      updateData.logo = `/uploads/${file.filename}`;
    }

    const row = await Company.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!row) {
      return res.status(404).json({ message: "Company not found", success: false });
    }
    const company = { ...row, _id: String(row.id || row._id), id: String(row.id || row._id) };
    return res.status(200).json({ message: "Company updated", company, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
