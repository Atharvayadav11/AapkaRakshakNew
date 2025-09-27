import React, { useState } from "react";
import { useIsCriminal } from "@/hooks/IsCriminal";
import { MapPin, Clock, Calendar, Download } from "lucide-react";
import jsPDF from 'jspdf';

const crimes = [
  {
    "id": "IR-2024-08-20-001",
    "location": {
      "city": "Mumbai",
      "area": "Colaba",
      "nearbyLandmarks": ["Gateway of India", "Taj Mahal Palace Hotel"]
    },
    "crime_type": "Robbery",
    "description": "I saw three men with masks run out of Sparkle Jewelers on Shahid Bhagat Singh Road. They were carrying bags and one had a gun. It happened so fast, but I heard screaming from inside the store.",
    "date": "2024-08-20",
    "time": "14:30",
    "timeOfDay": "Afternoon",
    "severity": "High",
    "image": "https://avatars.githubusercontent.com/u/127537459?v=4",
    "suspects": [
      {
        "description": "Male, early 30s, approximately 6 feet tall, muscular build, wearing a black mask and dark clothing"
      },
      {
        "description": "Male, mid 20s, around 5'8\", slim build, wearing a red cap and blue jeans"
      }
    ],
    "victims": [
      {
        "description": "Female store owner, late 50s, slight build, greying hair"
      }
    ],
    "weaponsInvolved": true,
    "propertyDamage": true,
    "recurringIncident": false,
    "witnessesPresent": true
  },
  {
    "id": "IR-2024-08-15-002",
    "location": {
      "city": "Pune",
      "area": "Shivajinagar",
      "nearbyLandmarks": ["Pune Railway Station", "Shivajinagar Court"]
    },
    "crime_type": "Assault",
    "description": "I was buying vegetables when I heard shouting. A group of men surrounded another man and started hitting him. People were yelling about money. It was terrifying, and nobody stepped in to help.",
    "date": "2024-08-15",
    "time": "10:45",
    "timeOfDay": "Morning",
    "severity": "Moderate",
    "image": "https://mahacid.gov.in/public/uploads/wanted/yJ4zLeQwnC1577791709-17.jpg",
    "suspects": [
      {
        "description": "Group of 4-5 men, ages ranging from 25-40, one with a distinctive scar on his left cheek"
      }
    ],
    "victims": [
      {
        "description": "Male, mid 40s, average build, wearing a white shirt and brown pants"
      }
    ],
    "weaponsInvolved": false,
    "propertyDamage": false,
    "recurringIncident": false,
    "witnessesPresent": true
  },
  {
    "id": "IR-2024-08-18-003",
    "location": {
      "city": "Nagpur",
      "area": "Sitabuldi",
      "nearbyLandmarks": ["Sitabuldi Fort", "Central Museum"]
    },
    "crime_type": "Vandalism",
    "description": "A large group of protesters turned violent near Sitabuldi Fort. They were breaking shop windows, overturning vehicles, and spray-painting walls. It was chaos, and people were running everywhere to get away.",
    "date": "2024-08-18",
    "time": "18:20",
    "timeOfDay": "Evening",
    "severity": "High",
    "image": "https://mahacid.gov.in/public/uploads/wanted/0ANOvojVep1578131585-1.jpg",
    "weaponsInvolved": false,
    "propertyDamage": true,
    "recurringIncident": false,
    "witnessesPresent": true
  },
  {
    "id": "IR-2024-08-22-004",
    "location": {
      "city": "Nashik",
      "area": "College Road",
      "nearbyLandmarks": ["K.T.H.M. College", "Nashik City Center Mall"]
    },
    "crime_type": "Burglary",
    "description": "I returned home from work to find my front door forced open. My house was ransacked, and all my valuables were gone. I later learned from neighbors that several houses on our street were hit the same day.",
    "date": "2024-08-22",
    "time": "20:15",
    "timeOfDay": "Night",
    "severity": "Moderate",
    "image": "https://mahacid.gov.in/public/uploads/wanted/NU1CeC1nDA1578131099-1.jpg",
    "suspects": [
      {
        "description": "Unknown, neighbors reported seeing a suspicious white van in the area"
      }
    ],
    "victims": [
      {
        "description": "Multiple homeowners in the College Road residential area"
      }
    ],
    "weaponsInvolved": false,
    "propertyDamage": true,
    "recurringIncident": true,
    "witnessesPresent": false
  },
  {
    "id": "IR-2024-08-19-005",
    "location": {
      "city": "Aurangabad",
      "area": "Jalna Road",
      "nearbyLandmarks": ["MGM Hospital", "Prozone Mall"]
    },
    "crime_type": "Hit-and-Run",
    "description": "I was waiting at the traffic signal when a speeding red car ran the light and hit a man crossing the road. The car didn't even slow down and just drove off. The poor man was badly hurt and wasn't moving.",
    "date": "2024-08-19",
    "time": "09:30",
    "timeOfDay": "Morning",
    "severity": "Critical",
    "image": "https://mahacid.gov.in/public/uploads/wanted/rjUqiG2OBZ1578130887-1.jpg",
    "suspects": [
      {
        "description": "Driver of a red sedan, possibly a Honda City, partial number plate MH-20 BX"
      }
    ],
    "victims": [
      {
        "description": "Male pedestrian, early 60s, wearing a blue shirt and grey trousers"
      }
    ],
    "weaponsInvolved": false,
    "propertyDamage": false,
    "recurringIncident": false,
    "witnessesPresent": true
  },
  {
    "id": "IR-2024-08-25-006",
    "location": {
      "city": "Thane",
      "area": "Ghodbunder Road",
      "nearbyLandmarks": ["Viviana Mall", "Jupiter Hospital"]
    },
    "crime_type": "Cyber Crime",
    "description": "I received an email that looked like it was from my bank. It asked me to update my details urgently. I clicked the link and entered my information. The next day, I found out my account had been emptied. Many others in my apartment complex faced the same issue.",
    "date": "2024-08-25",
    "time": "13:45",
    "timeOfDay": "Afternoon",
    "severity": "Moderate",
    "image": "https://i.imgur.com/hU5yg4z.jpeg",
    "suspects": [
      {
        "description": "Unknown cyber criminals"
      }
    ],
    "victims": [
      {
        "description": "Multiple residents of Ghodbunder Road area, ages ranging from 25-60, both male and female"
      }
    ],
    "weaponsInvolved": false,
    "propertyDamage": false,
    "recurringIncident": true,
    "witnessesPresent": false
  }
  
]

const Reports = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Incident Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {crimes.map((crime) => (
          <IncidentCard key={crime.id} crime={crime} />
        ))}
      </div>
    </div>
  );
};

const IncidentCard = ({ crime }) => {
  const [isChecked, setIsChecked] = useState(false);
  const { fetchResponse, error, loading } = useIsCriminal();
  const [criminalStatus, setCriminalStatus] = useState("Check Most Wanted List");
  const [isCriminal, setIsCriminal] = useState(false);

  const handleClick = async () => {
    const res = await fetchResponse(crime.image);
    if (res) {
      setCriminalStatus(res.message);
      setIsCriminal(res.result === "Red");
    } else {
      setCriminalStatus("Error checking criminal status");
      setIsCriminal(false);
    }
  };

  const handleCheckboxChange = () => {
    if (!isChecked) {
      handleClick();
    }
    setIsChecked(!isChecked);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Low': return 'bg-yellow-500';
      case 'Moderate': return 'bg-orange-500';
      case 'High': return 'bg-[#FB5454]';
      case 'Critical': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("Incident Report", 105, 15, { align: "center" });

    // Try to load and include the actual image
    try {
      console.log('Loading image for PDF:', crime.image);
      
      // Create a new image element
      const img = new Image();
      
      // Try different approaches to load the image
      let imageData = null;
      
      try {
        // First, try to fetch the image as a blob and convert to data URL
        const response = await fetch(crime.image, { mode: 'cors' });
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          
          await new Promise((resolve, reject) => {
            reader.onload = () => {
              imageData = reader.result;
              resolve();
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      } catch (fetchError) {
        console.log('Direct fetch failed, trying proxy:', fetchError.message);
        
        // Try with CORS proxy
        try {
          const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(crime.image);
          const proxyResponse = await fetch(proxyUrl);
          
          if (proxyResponse.ok) {
            const blob = await proxyResponse.blob();
            const reader = new FileReader();
            
            await new Promise((resolve, reject) => {
              reader.onload = () => {
                imageData = reader.result;
                resolve();
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (proxyError) {
          console.log('Proxy fetch also failed:', proxyError.message);
        }
      }
      
      // If we have image data, add it to the PDF
      if (imageData) {
        console.log('Image loaded successfully, adding to PDF');
        
        // Load the image to get dimensions
        img.src = imageData;
        await new Promise((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = resolve;
            img.onerror = resolve;
          }
        });
        
        if (img.naturalWidth > 0) {
          // Calculate dimensions to fit in the PDF
          let imgWidth = 70;
          let imgHeight = (img.height * imgWidth) / img.width;
          
          // Ensure it fits within the available space
          if (imgHeight > 60) {
            imgHeight = 60;
            imgWidth = (img.width * imgHeight) / img.height;
          }
          
          // Add the image to the PDF
          doc.addImage(imageData, 'JPEG', 140, 25, imgWidth, imgHeight);
          console.log('Image added to PDF successfully');
        } else {
          throw new Error('Image dimensions invalid');
        }
      } else {
        throw new Error('Could not load image data');
      }
      
    } catch (error) {
      console.log('Failed to load image:', error.message);
      
      // Fallback: Add image placeholder
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Image Reference:", 20, 25);
      doc.text(crime.image, 20, 32, { maxWidth: 100 });
      
      // Add a border box where the image would be
      doc.setDrawColor(200, 200, 200);
      doc.rect(140, 25, 70, 60);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Image unavailable", 145, 55);
      doc.text("(CORS restricted)", 145, 62);
    }
    
    addTextContent(doc);
    
    // Save the PDF
    doc.save(`incident-report-${crime.id}.pdf`);
    console.log('PDF generated successfully');
  };

  const addTextContent = (doc) => {
    doc.setFontSize(12);
    doc.text(`ID: ${crime.id}`, 20, 30);
    doc.text(`Type: ${crime.crime_type}`, 20, 40);
    doc.text(`Date: ${crime.date}`, 20, 50);
    doc.text(`Time: ${crime.time} (${crime.timeOfDay})`, 20, 60);
    doc.text(`Location: ${crime.location.city}, ${crime.location.area}`, 20, 70);
    doc.text(`Severity: ${crime.severity}`, 20, 80);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 51, 102);
    doc.text("Description:", 20, 95);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const splitDescription = doc.splitTextToSize(crime.description, 170);
    doc.text(splitDescription, 20, 105);
  };

  return (
    <div className={`bg-white rounded-lg overflow-hidden flex flex-col transition-all duration-500 ${
      isCriminal ? 'animate-pulse-red shadow-lg shadow-red-500/50' : 'shadow-lg'
    }`}>
      <div className="h-48 overflow-hidden relative">
        <img
          src={crime.image}
          alt={crime.crime_type}
          className="w-full h-full object-cover"
        />
        <div className={`absolute top-0 right-0 ${getSeverityColor(crime.severity)} text-white px-3 py-1 text-sm font-semibold`}>
          {crime.severity}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{crime.crime_type}</h2>
          <span className="text-sm text-gray-500">{crime.id}</span>
        </div>
        <div className="space-y-2 mb-4">
          <p className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2" />
            {crime.location.city}, {crime.location.area}
          </p>
          <p className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            {crime.time} ({crime.timeOfDay})
          </p>
          <p className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            {crime.date}
          </p>
        </div>
        <p className="text-sm mb-4 flex-grow">{crime.description}</p>
        <div className="space-y-2 mb-4">
          <p className="text-sm"><strong>Nearby Landmarks:</strong> {crime.location.nearbyLandmarks.join(", ")}</p>
          {(crime.suspects ?? []).length > 0 && (
            <p className="text-sm"><strong>Suspects:</strong> {(crime.suspects ?? []).map(s => s.description).join("; ")}</p>
          )}
          {(crime.victims ?? []).length > 0 && (
            <p className="text-sm"><strong>Victims:</strong> {(crime.victims ?? []).map(v => v.description).join("; ")}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {crime.weaponsInvolved && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Weapons Involved</span>}
          {crime.propertyDamage && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">Property Damage</span>}
          {crime.recurringIncident && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Recurring Incident</span>}
          {crime.witnessesPresent && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Witnesses Present</span>}
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              id={`checkbox-${crime.id}`}
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={isChecked}
              onChange={handleCheckboxChange}
              disabled={loading}
            />
            <label htmlFor={`checkbox-${crime.id}`} className="text-sm">
              {loading ? "Checking..." : criminalStatus}
            </label>
          </div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 flex items-center"
            onClick={() => generatePDF().catch(console.error)}
          >
            <Download size={16} className="mr-2" />
            Full Report Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
