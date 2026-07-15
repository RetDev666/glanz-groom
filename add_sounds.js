const fs = require('fs');

function addSoundToUpdateStatus(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the updateStatus function block
  const searchString = `if (res.ok) {
        fetchAppointments();
      }`;
      
  const replacementString = `if (res.ok) {
        try {
          let url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
          if (status === 'confirmed') url = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';
          if (status === 'completed') url = 'https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3';
          if (status === 'cancelled') url = 'https://assets.mixkit.co/active_storage/sfx/2872/2872-preview.mp3';
          new Audio(url).play().catch(() => {});
        } catch(e) {}
        fetchAppointments();
      }`;
      
  if (content.includes(searchString)) {
    content = content.replace(searchString, replacementString);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  } else {
    console.log('Could not find target in ' + filePath);
  }
}

addSoundToUpdateStatus('admin/pages/appointments.tsx');
addSoundToUpdateStatus('admin/pages/calendar.tsx');
