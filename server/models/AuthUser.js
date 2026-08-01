import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const authUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },
    githubUsername: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['local', 'github', 'both'],
      default: 'local',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before save
authUserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
authUserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const AuthUser = mongoose.model('AuthUser', authUserSchema);

export default AuthUser;
