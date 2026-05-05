import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({ name: String });
const Skill = mongoose.model('Skill', skillSchema);

const skillEntrySchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }
});

const userSchema = new mongoose.Schema({
  skillsOffered: [skillEntrySchema]
});
userSchema.methods.toPublicJSON = function() {
  return {
    skillsOffered: this.skillsOffered
  };
};

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test_mongoose');
  await Skill.deleteMany({});
  await User.deleteMany({});
  
  const skill1 = await Skill.create({ name: 'JavaScript' });
  const user = await User.create({
    skillsOffered: [{ skill: skill1._id }]
  });
  
  const populatedUser = await User.findById(user._id).populate('skillsOffered.skill');
  console.log('Populated User toPublicJSON:', JSON.stringify(populatedUser.toPublicJSON(), null, 2));
  
  await mongoose.disconnect();
}
run();
