import mongoose from "mongoose";

const patientCheckInSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true,
        // Format: YYYY-MM-DD
        validate: {
            validator: function(v) {
                return /^\d{4}-\d{2}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid date format! Please use YYYY-MM-DD`
        }
    },
    answers: [{
        questionId: {
            type: String,
            required: true
        },
        answerType: {
            type: String,
            enum: ['choice', 'text', 'voice'],
            required: true
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        rawText: {
            type: String,
            required: false
        }
    }],
    computedSignals: {
        painScore: {
            type: Number,
            min: 0,
            max: 10,
            required: true
        },
        mobilityScore: {
            type: Number,
            min: 0,
            max: 10,
            required: true
        },
        moodScore: {
            type: Number,
            min: 0,
            max: 10,
            required: true
        },
        medicationAdherence: {
            type: Boolean,
            required: true
        }
    }
}, {
    timestamps: true
});

// Index for faster lookups by patient and date
patientCheckInSchema.index({ patientId: 1, date: 1 }, { unique: true });

const PatientCheckIn = mongoose.model("PatientCheckIn", patientCheckInSchema);

export default PatientCheckIn;
