// utils/verification.service.js

const verifyKycMock = (filename) => {
    const name = filename.toLowerCase();

    // Auto-approve if file includes "valid"
    if (name.includes("adhar") || name.includes("pan")) {
        return "approved";
    }

    // Auto-reject if file includes "fake" or "invalid"
    if (name.includes("fake") || name.includes("invalid")) {
        return "rejected";
    }

    // 🔄 Otherwise, randomly approve or reject (simulating AI or OCR decision)
    const decision = Math.random() > 0.5 ? "approved" : "rejected";
    return decision;
};

module.exports = verifyKycMock;
