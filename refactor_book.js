const fs = require('fs');
let content = fs.readFileSync('frontend/pages/book.tsx', 'utf8');

// 1. Interfaces
content = content.replace(
  /interface BookingState \{[\s\S]*?acceptTerms: boolean;\n\}/,
  `interface PetBooking {
  id: string;
  petSize: 'xs' | 's' | 'm' | 'l' | 'xl';
  selectedServices: number[];
  petName: string;
  petBreed: string;
  photoFile: File | null;
  photoPreview: string | null;
}

interface BookingState {
  pets: PetBooking[];
  groomerId: number | null;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  acceptTerms: boolean;
}`
);

// 2. Initial state
content = content.replace(
  /const \[booking, setBooking\] = useState<BookingState>\(\{\s+selectedServices: \[\],\s+petSize: 'm',\s+groomerId: null,[\s\S]*?acceptTerms: false,\s+\}\);/,
  `const [booking, setBooking] = useState<BookingState>({
    pets: [{
      id: '1',
      petSize: 'm',
      selectedServices: [],
      petName: '',
      petBreed: '',
      photoFile: null,
      photoPreview: null,
    }],
    groomerId: null,
    date: '',
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    acceptTerms: false,
  });`
);

// 3. Query params
content = content.replace(
  /setBooking\(b => \(\{ \.\.\.b, petSize: s as any \}\)\);/,
  `setBooking(b => ({ ...b, pets: [{ ...b.pets[0], petSize: s as any }] }));`
);
content = content.replace(
  /setBooking\(b => \(\{ \.\.\.b, selectedServices: matchingIds \}\)\);/,
  `setBooking(b => ({ ...b, pets: [{ ...b.pets[0], selectedServices: matchingIds }] }));`
);

// 4. totalPrice and totalDuration
content = content.replace(
  /const priceKey = SIZE_PRICE_KEY\[booking\.petSize\];\s+const durationKey = SIZE_DURATION_KEY\[booking\.petSize\];\s+const totalPrice = booking\.selectedServices[\s\S]*?reduce\(\(sum, s\) => sum \+ \(Number\(s\!\[durationKey\]\) \|\| 0\), 0\);/,
  `const totalPrice = booking.pets.reduce((sum, pet) => {
    const priceKey = SIZE_PRICE_KEY[pet.petSize];
    return sum + pet.selectedServices
      .map(id => services.find(s => s.id === id))
      .filter(Boolean)
      .reduce((sSum, s) => sSum + (Number(s![priceKey]) || 0), 0);
  }, 0);

  const totalDuration = booking.pets.reduce((sum, pet) => {
    const durationKey = SIZE_DURATION_KEY[pet.petSize];
    return sum + pet.selectedServices
      .map(id => services.find(s => s.id === id))
      .filter(Boolean)
      .reduce((sSum, s) => sSum + (Number(s![durationKey]) || 0), 0);
  }, 0);`
);

// 5. toggleService (We will just define a new function and we will manually fix step 0)
// For now, let's just do it directly.
content = content.replace(
  /const toggleService = \(id: number, isPackage: boolean\) => \{[\s\S]*?\}\);\s+\};/,
  `const toggleService = (petIndex: number, id: number, isPackage: boolean) => {
    setBooking(b => {
      const newPets = [...b.pets];
      const pet = { ...newPets[petIndex] };
      if (isPackage) {
        const currentAddons = pet.selectedServices.filter(sid => services.find(s => s.id === sid)?.category !== 'Основні послуги');
        pet.selectedServices = [...currentAddons, id];
      } else {
        if (pet.selectedServices.includes(id)) {
          pet.selectedServices = pet.selectedServices.filter(x => x !== id);
        } else {
          pet.selectedServices = [...pet.selectedServices, id];
        }
      }
      newPets[petIndex] = pet;
      return { ...b, pets: newPets };
    });
  };`
);

// 7. canNext
content = content.replace(
  /const canNext = \(\) => \{[\s\S]*?return false;\s+\};/,
  `const canNext = () => {
    if (step === 0) return booking.pets.every(p => p.selectedServices.length > 0);
    if (step === 1) return booking.groomerId !== null;
    if (step === 2) return booking.date && booking.time;
    if (step === 3) return booking.firstName && booking.email && booking.phone && booking.pets.every(p => p.petName) && booking.acceptTerms;
    return false;
  };`
);

// 8. handleSubmit
content = content.replace(
  /const handleSubmit = async \(\) => \{[\s\S]*?setSubmitted\(true\);\s+\} catch \(err\) \{[\s\S]*?\}\s+\};/,
  `const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const dateTime = new Date(\`\${booking.date}T\${booking.time}:00\`);
      let currentDateTime = dateTime;

      for (const pet of booking.pets) {
        let petPhotoUrl = null;
        if (pet.photoFile) {
          const formData = new FormData();
          formData.append('photo', pet.photoFile);
          const uploadRes = await fetch(\`\${apiUrl}/upload/pet-photo\`, {
            method: 'POST',
            body: formData,
          });
          if (uploadRes.ok) {
            petPhotoUrl = (await uploadRes.json()).url;
          }
        }

        const durationKey = SIZE_DURATION_KEY[pet.petSize];
        const petDuration = pet.selectedServices
          .map(id => services.find(s => s.id === id))
          .filter(Boolean)
          .reduce((sum, s) => sum + (Number(s![durationKey]) || 0), 0);
        
        const priceKey = SIZE_PRICE_KEY[pet.petSize];
        const petPrice = pet.selectedServices
          .map(id => services.find(s => s.id === id))
          .filter(Boolean)
          .reduce((sum, s) => sum + (Number(s![priceKey]) || 0), 0);

        const res = await fetch(\`\${apiUrl}/appointments\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clientFirstName: booking.firstName,
            clientLastName: booking.lastName,
            clientEmail: booking.email,
            clientPhone: booking.phone,
            petName: pet.petName,
            petBreed: pet.petBreed,
            petSize: pet.petSize,
            petPhotoUrl,
            notes: booking.notes,
            groomerId: booking.groomerId,
            date: currentDateTime.toISOString(),
            serviceIds: pet.selectedServices,
            duration: petDuration,
            totalPrice: petPrice
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Fehler beim Erstellen');
        }

        currentDateTime = new Date(currentDateTime.getTime() + petDuration * 60000);
      }
      
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t.book.step3.error);
    } finally {
      setLoading(false);
    }
  };`
);

fs.writeFileSync('frontend/pages/book.tsx', content);
console.log('Script executed');
