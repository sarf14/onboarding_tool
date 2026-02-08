import { supabase } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

// Mapping of old names to new credentials
const userUpdates = [
  // Admin
  { oldName: 'Admin User', newName: 'admin', newPassword: 'admin' },
  
  // Annotators - First list
  { oldName: 'Akansha', newName: 'annotator11', newPassword: '11' },
  { oldName: 'Abhijit', newName: 'annotator14', newPassword: '14' },
  { oldName: 'Vinayak', newName: 'annotator17', newPassword: '17' },
  { oldName: 'Rajani Chouhan', newName: 'annotator24', newPassword: '24' },
  { oldName: 'Aayan Mulla', newName: 'annotator25', newPassword: '25' },
  { oldName: 'Anjali Auti', newName: 'annotator26', newPassword: '26' },
  { oldName: 'Khushi', newName: 'annotator27', newPassword: '27' },
  { oldName: 'Varsha Hulmani', newName: 'annotator28', newPassword: '28' },
  { oldName: 'Annotator 29', newName: 'annotator29', newPassword: '29' },
  { oldName: 'Shivam Lagdive', newName: 'annotator30', newPassword: '30' },
  { oldName: 'Annotator 31', newName: 'annotator31', newPassword: '31' },
  { oldName: 'Aastha Raina', newName: 'annotator32', newPassword: '32' },
  { oldName: 'Sameer Tadavi', newName: 'annotator33', newPassword: '33' },
  { oldName: 'Devendra Kawade', newName: 'annotator34', newPassword: '34' },
  { oldName: 'Shraddha Patel', newName: 'annotator35', newPassword: '35' },
  { oldName: 'Anjali Dongre', newName: 'annotator36', newPassword: '36' },
  { oldName: 'Purva Golegoankar', newName: 'annotator37', newPassword: '37' },
  { oldName: 'Sarfaraz', newName: 'annotator38', newPassword: '38' },
  { oldName: 'Mustafa', newName: 'annotator39', newPassword: '39' },
  
  // Annotators - Second list
  { oldName: 'Karan', newName: 'annotator8', newPassword: '8' },
  { oldName: 'Rahul', newName: 'annotator9', newPassword: '9' },
  { oldName: 'Snovia', newName: 'annotator10', newPassword: '10' },
  { oldName: 'Prathamesh', newName: 'annotator12', newPassword: '12' },
  { oldName: 'Annotator 13', newName: 'annotator13', newPassword: '13' },
  { oldName: 'Jay', newName: 'annotator15', newPassword: '15' },
  { oldName: 'Eknath', newName: 'annotator16', newPassword: '16' },
];

async function updateUserCredentials() {
  console.log('🔄 Updating user credentials...\n');

  for (const update of userUpdates) {
    try {
      // Check if user exists with old name
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id, name')
        .eq('name', update.oldName)
        .single();

      if (findError || !existingUser) {
        // Try to find by new name (might already be updated)
        const { data: newUser } = await supabase
          .from('users')
          .select('id, name')
          .eq('name', update.newName)
          .single();

        if (newUser) {
          console.log(`⏭️  User "${update.newName}" already exists with new credentials, skipping...`);
          continue;
        } else {
          console.log(`⚠️  User "${update.oldName}" not found, skipping...`);
          continue;
        }
      }

      // Hash new password
      const hashedPassword = await hashPassword(update.newPassword);

      // Update user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: update.newName,
          password: hashedPassword,
        })
        .eq('id', existingUser.id);

      if (updateError) {
        console.error(`❌ Failed to update ${update.oldName}:`, updateError.message);
      } else {
        console.log(`✅ Updated: "${update.oldName}" → "${update.newName}" (password: ${update.newPassword})`);
      }
    } catch (error: any) {
      console.error(`❌ Error updating ${update.oldName}:`, error.message);
    }
  }

  console.log('\n✨ Credentials update completed!');
  console.log('\n📋 New Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Name: admin');
  console.log('  Password: admin');
  console.log('\nAnnotators:');
  console.log('  Name: annotatorXX (where XX is the ID)');
  console.log('  Password: XX (just the ID number)');
}

// Run if executed directly
if (require.main === module) {
  updateUserCredentials()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default updateUserCredentials;
