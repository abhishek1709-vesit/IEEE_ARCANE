import PatientCheckIn from "../models/PatientCheckIn.js";
import jwt from "jsonwebtoken";

// Helper function to compute trend comparison
const computeTrend = (currentValue, previousValue) => {
    if (previousValue === null || previousValue === undefined) {
        return 'first_entry';
    }

    if (currentValue > previousValue) {
        return 'improved';
    } else if (currentValue < previousValue) {
        return 'worse';
    } else {
        return 'stable';
    }
};

// Helper function to generate safe, reassuring summary
const generateSafeSummary = (trends, currentSignals) => {
    // This is a mock implementation - in production you would call an LLM API
    // but with strict safety constraints

    const { painTrend, mobilityTrend, moodTrend, medicationTrend } = trends;
    const { painScore, mobilityScore, moodScore, medicationAdherence } = currentSignals;

    // Generate summary lines
    const summaryLines = [];

    // Pain trend summary
    if (painTrend === 'first_entry') {
        summaryLines.push(`Your pain level is currently ${painScore}/10.`);
    } else if (painTrend === 'improved') {
        summaryLines.push(`Your pain level has improved compared to yesterday.`);
    } else if (painTrend === 'worse') {
        summaryLines.push(`Your pain level is slightly higher than yesterday.`);
    } else {
        summaryLines.push(`Your pain level remains stable compared to yesterday.`);
    }

    // Mobility trend summary
    if (mobilityTrend === 'first_entry') {
        summaryLines.push(`Your mobility comfort is currently ${mobilityScore}/10.`);
    } else if (mobilityTrend === 'improved') {
        summaryLines.push(`Your mobility has improved, which is great progress.`);
    } else if (mobilityTrend === 'worse') {
        summaryLines.push(`Your mobility comfort is slightly lower today.`);
    } else {
        summaryLines.push(`Your mobility remains consistent with yesterday.`);
    }

    // Medication adherence
    if (medicationAdherence) {
        summaryLines.push(`You're doing well with your medication adherence.`);
    } else {
        summaryLines.push(`Remember to follow your medication schedule as prescribed.`);
    }

    // Select a positive reassurance quote
    const reassuranceQuotes = [
        "Every small step in your recovery is progress. Keep going!",
        "Your body is healing every day. Be patient and kind to yourself.",
        "Recovery takes time, but you're moving in the right direction.",
        "Listen to your body and celebrate each improvement, no matter how small.",
        "You're stronger than you think. Each day brings you closer to better health."
    ];

    const randomQuote = reassuranceQuotes[Math.floor(Math.random() * reassuranceQuotes.length)];

    return {
        summary: summaryLines.slice(0, 2).join(' '), // Take first 2 lines
        reassurance: randomQuote
    };
};

// Check if today's check-in exists
export const checkTodayCheckIn = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patientId = decoded.userId;

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayDateString = today.toISOString().split('T')[0];

        const existingCheckIn = await PatientCheckIn.findOne({
            patientId,
            date: todayDateString
        });

        res.status(200).json({
            exists: !!existingCheckIn,
            date: todayDateString
        });
    } catch (error) {
        console.error('Error checking today check-in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Submit daily check-in
export const submitCheckIn = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patientId = decoded.userId;

        const { date, answers } = req.body;

        if (!date || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid check-in data' });
        }

        // Compute signals from answers
        const computedSignals = {
            painScore: 0,
            mobilityScore: 0,
            moodScore: 0,
            medicationAdherence: false
        };

        // Process answers to compute signals
        answers.forEach(answer => {
            if (answer.questionId === 'pain_level' && typeof answer.value === 'number') {
                computedSignals.painScore = answer.value;
            }
            if (answer.questionId === 'mobility_comfort' && typeof answer.value === 'number') {
                computedSignals.mobilityScore = answer.value;
            }
            if (answer.questionId === 'emotional_state' && typeof answer.value === 'number') {
                computedSignals.moodScore = answer.value;
            }
            if (answer.questionId === 'medication_adherence' && typeof answer.value === 'boolean') {
                computedSignals.medicationAdherence = answer.value;
            }
        });

        // Create new check-in
        const newCheckIn = new PatientCheckIn({
            patientId,
            date,
            answers,
            computedSignals
        });

        await newCheckIn.save();

        res.status(201).json({
            message: 'Check-in submitted successfully',
            checkInId: newCheckIn._id
        });
    } catch (error) {
        console.error('Error submitting check-in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Generate check-in summary
export const generateCheckInSummary = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const patientId = decoded.userId;

        const { date } = req.body;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        // Get today's check-in
        const todayCheckIn = await PatientCheckIn.findOne({
            patientId,
            date
        });

        if (!todayCheckIn) {
            return res.status(404).json({ message: 'Check-in not found' });
        }

        // Get yesterday's check-in for comparison
        const yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateString = yesterday.toISOString().split('T')[0];

        const yesterdayCheckIn = await PatientCheckIn.findOne({
            patientId,
            date: yesterdayDateString
        });

        // Compute trends
        const trends = {
            painTrend: computeTrend(
                todayCheckIn.computedSignals.painScore,
                yesterdayCheckIn?.computedSignals?.painScore
            ),
            mobilityTrend: computeTrend(
                todayCheckIn.computedSignals.mobilityScore,
                yesterdayCheckIn?.computedSignals?.mobilityScore
            ),
            moodTrend: computeTrend(
                todayCheckIn.computedSignals.moodScore,
                yesterdayCheckIn?.computedSignals?.moodScore
            ),
            medicationTrend: todayCheckIn.computedSignals.medicationAdherence
                ? 'adherent'
                : 'non_adherent'
        };

        // Generate safe summary
        const summary = generateSafeSummary(trends, todayCheckIn.computedSignals);

        res.status(200).json(summary);
    } catch (error) {
        console.error('Error generating check-in summary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
