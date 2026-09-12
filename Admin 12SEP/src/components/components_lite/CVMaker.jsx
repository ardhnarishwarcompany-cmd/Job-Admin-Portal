import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const CVMaker = () => {
  const [cvData, setCvData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
  });

  const handleChange = (e) => {
    setCvData({ ...cvData, [e.target.name]: e.target.value });
  };

  const generateCV = () => {
    // Simple CV generation - in a real app, use a library like jsPDF or html2pdf
    const cvHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h1 style="color: white;">${cvData.name}</h1>
        <p>${cvData.email} | ${cvData.phone}</p>
        <p>${cvData.address}</p>
        <h2 style="color: #ffd700;">Professional Summary</h2>
        <p>${cvData.summary}</p>
        <h2 style="color: #ffd700;">Experience</h2>
        <p>${cvData.experience}</p>
        <h2 style="color: #ffd700;">Education</h2>
        <p>${cvData.education}</p>
        <h2 style="color: #ffd700;">Skills</h2>
        <p>${cvData.skills}</p>
      </div>
    `;

    const newWindow = window.open();
    newWindow.document.write(cvHTML);
    newWindow.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-4 bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg shadow-lg">
      <div className="bg-white rounded-lg p-6 shadow-inner">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">CV Maker</h1>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-700 font-semibold">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={cvData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={cvData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={cvData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address" className="text-gray-700 font-semibold">Address</Label>
              <Input
                id="address"
                name="address"
                value={cvData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="summary" className="text-gray-700 font-semibold">Professional Summary</Label>
            <textarea
              id="summary"
              name="summary"
              value={cvData.summary}
              onChange={handleChange}
              placeholder="Write a brief professional summary"
              rows={3}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="experience" className="text-gray-700 font-semibold">Work Experience</Label>
            <textarea
              id="experience"
              name="experience"
              value={cvData.experience}
              onChange={handleChange}
              placeholder="Describe your work experience"
              rows={4}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="education" className="text-gray-700 font-semibold">Education</Label>
            <textarea
              id="education"
              name="education"
              value={cvData.education}
              onChange={handleChange}
              placeholder="List your educational background"
              rows={3}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="skills" className="text-gray-700 font-semibold">Skills</Label>
            <textarea
              id="skills"
              name="skills"
              value={cvData.skills}
              onChange={handleChange}
              placeholder="List your skills (comma separated)"
              rows={2}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button onClick={generateCV} className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
            Generate CV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CVMaker;