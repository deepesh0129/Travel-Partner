// --- CONSTANTS & ENUMS ---
const Budget = {
  BUDGET: 'Budget',
  MID_RANGE: 'Mid-Range',
  LUXURY: 'Luxury',
};
const BUDGET_OPTIONS = [Budget.BUDGET, Budget.MID_RANGE, Budget.LUXURY];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// --- STATE ---
let state = {
  form: {
    destination: '',
    budget: Budget.MID_RANGE,
    travelMonth: MONTHS[new Date().getMonth()],
    tripDuration: 4,
  },
  suggestions: null,
  isLoading: false,
  error: null,
};

// --- UI COMPONENTS ---
function HeaderHTML() {
  return `<header class="header"><h1>Travel<span>Partner</span></h1><p>Offline AI Travel Planner</p></header>`;
}

function TravelFormHTML(formState) {
  return `
    <form id="travel-form" class="form">
      <input id="destination" name="destination" value="${formState.destination}" placeholder="Enter destination in India" required />
      
      <select id="budget" name="budget">
        ${BUDGET_OPTIONS.map(o => `<option ${formState.budget===o?'selected':''}>${o}</option>`).join('')}
      </select>

      <select id="travelMonth" name="travelMonth">
        ${MONTHS.map(m => `<option ${formState.travelMonth===m?'selected':''}>${m}</option>`).join('')}
      </select>

      <input type="number" id="tripDuration" name="tripDuration" value="${formState.tripDuration}" min="1" max="10"/>

      <button type="submit">Get Suggestions</button>
    </form>
  `;
}

function LoadingSpinnerHTML() {
  return `<p>Generating your trip...</p>`;
}

function ErrorMessageHTML(msg) {
  return `<p style="color:red">${msg}</p>`;
}

function ResultsHTML(data) {
  return `
    <h2>${data.destinationInfo.about}</h2>
    <p>${data.reasoning}</p>

    <h3>📍 Places</h3>
    ${data.placesToVisit.map(p => `<p><b>${p.name}</b> - ${p.description}</p>`).join('')}

    <h3>🍴 Food</h3>
    ${data.foodToTry.map(f => `<p><b>${f.name}</b> - ${f.description}</p>`).join('')}

    <h3>🏨 Stay</h3>
    ${data.accommodationSuggestions.map(a => `<p><b>${a.type}</b> - ${a.pricePerNight}</p>`).join('')}
  `;
}

// --- MOCK AI ENGINE ---
function generateMockSuggestions({ destination, travelMonth, tripDuration }) {

  const places = [
    {
      name: "City Center",
      description: `Explore ${destination}'s main attractions`,
      entryFee: "₹0",
      openingHours: "9AM-8PM",
      bestTimeToVisit: "Morning",
      modeOfTransport: "Auto",
      nearestPetrolStation: "Indian Oil",
      nearbyAttractions: ["Market"],
      travelTips: ["Go early"]
    },
    {
      name: "Temple",
      description: "Famous spiritual place",
      entryFee: "Free",
      openingHours: "6AM-9PM",
      bestTimeToVisit: "Morning",
      modeOfTransport: "Walk",
      nearestPetrolStation: "HP",
      nearbyAttractions: ["River"],
      travelTips: ["Dress modestly"]
    },
    {
      name: "Nature Spot",
      description: "Relaxing area",
      entryFee: "₹50",
      openingHours: "8AM-6PM",
      bestTimeToVisit: "Evening",
      modeOfTransport: "Cab",
      nearestPetrolStation: "BP",
      nearbyAttractions: ["Hill"],
      travelTips: ["Carry water"]
    }
  ];

  const foods = [
    {
      name: "Thali",
      description: "Full meal",
      estimatedCost: "₹200",
      favoriteSpots: ["Local Hotel"],
      dietaryInformation: "Veg",
      mustTryAt: "Famous Mess",
      popularTimes: "Lunch",
      servingSuggestion: "Hot",
      travelTips: ["Eat fresh"]
    },
    {
      name: "Street Food",
      description: "Snacks",
      estimatedCost: "₹50",
      favoriteSpots: ["Street"],
      dietaryInformation: "Veg",
      mustTryAt: "Market",
      popularTimes: "Evening",
      servingSuggestion: "Hot",
      travelTips: ["Check hygiene"]
    },
    {
      name: "Sweet",
      description: "Dessert",
      estimatedCost: "₹100",
      favoriteSpots: ["Bakery"],
      dietaryInformation: "Veg",
      mustTryAt: "Sweet Shop",
      popularTimes: "Anytime",
      servingSuggestion: "After meal",
      travelTips: ["Try fresh"]
    }
  ];

  const stays = [
    { type: "Budget Hotel", pricePerNight: "₹1000" },
    { type: "Mid Hotel", pricePerNight: "₹3000" },
    { type: "Luxury Hotel", pricePerNight: "₹7000" }
  ];

  const days = Array.from({length: tripDuration}, (_,i)=>({
    day: i+1,
    title: "Explore",
    theme: "Travel",
    schedule: [
      { time:"Morning", activity:"Visit", description:places[0].name },
      { time:"Afternoon", activity:"Eat", description:foods[0].name },
      { time:"Evening", activity:"Relax", description:"Walk" }
    ]
  }));

  return {
    destinationInfo: {
      about: `${destination} is a great place in India.`,
      history: "Rich history",
      localSpecialty: "Food & culture"
    },
    isGoodTimeToVisit: true,
    reasoning: `Good weather in ${travelMonth}`,
    bestTimeToVisit: "Oct-Mar",
    dayByDayPlan: days,
    placesToVisit: places,
    foodToTry: foods,
    accommodationSuggestions: stays
  };
}

// --- FAKE API CALL ---
async function getTravelSuggestions(formState) {
  await new Promise(r => setTimeout(r, 1000));
  return generateMockSuggestions(formState);
}

// --- EVENTS ---
function handleSubmit(e) {
  e.preventDefault();

  if (!state.form.destination) {
    state.error = "Enter destination";
    render();
    return;
  }

  state.isLoading = true;
  render();

  getTravelSuggestions(state.form)
    .then(data => {
      state.suggestions = data;
      state.error = null;
    })
    .catch(() => {
      state.error = "Something went wrong";
    })
    .finally(() => {
      state.isLoading = false;
      render();
    });
}

function handleChange(e) {
  state.form[e.target.name] = e.target.value;
}

// --- RENDER ---
function render() {
  const root = document.getElementById('root');

  let content = '';
  if (state.isLoading) content = LoadingSpinnerHTML();
  else if (state.error) content = ErrorMessageHTML(state.error);
  else if (state.suggestions) content = ResultsHTML(state.suggestions);
  else content = "<p>Enter details to plan your trip</p>";

  root.innerHTML = `
    ${HeaderHTML()}
    ${TravelFormHTML(state.form)}
    ${content}
  `;

  document.getElementById('travel-form')?.addEventListener('submit', handleSubmit);
  document.querySelectorAll('input, select').forEach(el =>
    el.addEventListener('input', handleChange)
  );
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', render);
