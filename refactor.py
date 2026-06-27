import os
import re

file_path = "frontend/pages/book.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Interfaces
text = re.sub(
    r"interface BookingState \{[\s\S]*?acceptTerms: boolean;\n\}",
    """interface PetBooking {
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
}""", text)

# 2. Initial state
text = re.sub(
    r"const \[booking, setBooking\] = useState<BookingState>\(\{\n\s+selectedServices: \[\],\n\s+petSize: 'm', // default\n\s+groomerId: null,[\s\S]*?acceptTerms: false,\n\s+\}\);",
    """const [booking, setBooking] = useState<BookingState>({
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
  });""", text)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)
print("State replaced.")
