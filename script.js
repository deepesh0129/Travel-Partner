// --- CONSTANTS & ENUMS ---
const Budget = {
  BUDGET: 'Budget',
  MID_RANGE: 'Mid-Range',
  LUXURY: 'Luxury',
};
const BUDGET_OPTIONS = [Budget.BUDGET, Budget.MID_RANGE, Budget.LUXURY];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// --- STATE MANAGEMENT ---
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

// --- HTML TEMPLATE GENERATORS ---

function HeaderHTML() {
  return `
    <header class="header">
      <h1>Travel<span>Partner</span></h1>
      <p>Plan, Explore, and Travel—Powered by AI </p>
    </header>
  `;
}

function TravelFormHTML(formState) {
    return `
        <form id="travel-form" class="form">
             <div class="form-grid">
                <!-- Destination Input -->
                <div class="form-group form-group-full">
                    <label for="destination" class="form-label">Destination in India</label>
                    <input type="text" id="destination" name="destination" value="${formState.destination}" placeholder="e.g., Tiruppur, India" class="form-input" required />
                </div>

                <!-- Budget -->
                <div class="form-group">
                    <label for="budget" class="form-label">Budget</label>
                    <select id="budget" name="budget" class="form-select">
                        ${BUDGET_OPTIONS.map(o => `<option value="${o}" ${formState.budget === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>
                </div>

                <!-- Month -->
                <div class="form-group">
                    <label for="travelMonth" class="form-label">Travel Month</label>
                    <select id="travelMonth" name="travelMonth" class="form-select">
                        ${MONTHS.map(m => `<option value="${m}" ${formState.travelMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
                    </select>
                </div>

                <!-- Duration -->
                <div class="form-group">
                    <label for="tripDuration" class="form-label">Duration (days)</label>
                    <input type="number" id="tripDuration" name="tripDuration" value="${formState.tripDuration}" min="1" max="30" class="form-input" />
                </div>
                
                <!-- Button -->
                <div class="form-group form-button-container">
                    <button type="submit" id="form-submit-button" class="button">
                        Get Suggestions
                    </button>
                </div>
            </div>
        </form>
    `;
}

function LoadingSpinnerHTML() {
  return `
    <div class="loading-spinner-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">AI is planning your perfect trip...</p>
      <p style="font-size: 0.875rem; color: var(--text-dark); margin-top: 0.25rem;">This might take a moment.</p>
    </div>
  `;
}

function ErrorMessageHTML(message) {
  return `
    <div class="error-message">
      <strong>Oops! </strong>
      <span>${message}</span>
    </div>
  `;
}

function WelcomeMessageHTML() {
    return `
        <div class="welcome-message">
            <h2>Ready for an Indian Adventure?</h2>
            <p style="color: var(--text-dark); margin-top: 0.5rem;">
                Fill out the form to get instant, AI-powered travel suggestions for destinations across India.
            </p>
            <p style="font-size: 0.75rem; color: #6b7280; margin-top: 1rem;">
                Note: A developer API key must be configured in script.js for this to work.
            </p>
        </div>
    `;
}

function ClimateAdviceHTML({ isGoodTimeToVisit, reasoning, bestTimeToVisit }) {
    const statusClass = isGoodTimeToVisit ? 'good' : 'bad';
    const icon = isGoodTimeToVisit ? '' : '�';
    const title = isGoodTimeToVisit ? 'Great Time to Visit!' : 'Consider Your Timing';
    return `
        <div class="climate-advice ${statusClass}">
            <h2 class="climate-title">
                <span>${icon}</span>
                ${title}
            </h2>
            <p class="climate-text">${reasoning}</p>
            ${!isGoodTimeToVisit ? `<p><span style="font-weight:600;">Suggested Time:</span> ${bestTimeToVisit}</p>` : ''}
        </div>
    `;
}

function DestinationInfoHTML({ info }) {
    return `
        <div class="section">
             <h2 class="section-title">About the Destination</h2>
             <div style="display:flex; flex-direction:column; gap: 1rem;">
                <div>
                    <h3 class="card-title"><
 Overview</h3>
                    <p class="card-description">${info.about}</p>
                </div>
                <div>
                    <h3 class="card-title">=� History</h3>
                    <p class="card-description">${info.history}</p>
                </div>
                <div>
                    <h3 class="card-title">( Local Specialty</h3>
                    <p class="card-description">${info.localSpecialty}</p>
                </div>
            </div>
        </div>
    `;
}

function DayByDayPlanHTML({ plan }) {
    return `
        <div class="section">
            <h2 class="section-title">Your Day-by-Day Itinerary</h2>
            <div class="accordion" id="day-plan-container">
                ${plan.map((dayPlan, index) => `
                    <div class="accordion-item">
                        <button class="accordion-button" data-day="${dayPlan.day}" aria-expanded="${index === 0}">
                            <div>
                                <h3>Day ${dayPlan.day}: ${dayPlan.title}</h3>
                                <p>${dayPlan.theme}</p>
                            </div>
                            <svg class="accordion-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        <div class="accordion-content">
                            <div class="accordion-content-inner">
                                ${dayPlan.schedule.map(item => `
                                    <div class="schedule-item">
                                        <div class="schedule-time">${item.time}</div>
                                        <div class="schedule-details">
                                            <p class="activity">${item.activity}</p>
                                            <p class="description">${item.description}</p>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function SuggestionCardHTML(item) {
    const isPlace = 'nearestPetrolStation' in item;
    const isFood = 'dietaryInformation' in item;
    const isAccommodation = 'pricePerNight' in item;

    const detailRow = ({ icon, label, value }) => `
        <div class="card-detail-row">
            <span class="card-detail-icon">${icon}</span>
            <span class="card-detail-label">${label}:</span>
            <span class="card-detail-value">${value}</span>
        </div>
    `;
    const renderList = (items) => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;

    return `
        <div class="suggestion-card">
            ${'type' in item && item.type ? `<span class="card-tag">${item.type}</span>` : ''}
            <h3 class="card-title">${item.name}</h3>
            <p class="card-description">${item.description}</p>
            <div class="card-divider">
                ${isPlace ? `
                    ${detailRow({ icon: '<�', label: 'Entry Fee', value: item.entryFee })}
                    ${detailRow({ icon: '�', label: 'Hours', value: item.openingHours })}
                    ${detailRow({ icon: '(', label: 'Best Time', value: item.bestVisitTime })}
                    ${detailRow({ icon: '=�', label: 'Transport', value: item.modeOfTransport })}
                    ${detailRow({ icon: '�', label: 'Petrol', value: item.nearestPetrolStation })}
                    ${detailRow({ icon: '<�', label: 'Nearby', value: renderList(item.nearbyAttractions) })}
                ` : ''}
                ${isFood ? `
                    ${detailRow({ icon: '=�', label: 'Est. Cost', value: item.estimatedCost })}
                    ${detailRow({ icon: '<6', label: 'Dietary', value: item.dietaryInformation })}
                    ${detailRow({ icon: 'P', label: 'Must Try', value: item.mustTryAt })}
                    ${detailRow({ icon: '=R', label: 'Popular', value: item.popularTimes })}
                    ${detailRow({ icon: '<}', label: 'Serving', value: item.servingSuggestion })}
                    ${detailRow({ icon: '=�', label: 'Top Spots', value: renderList(item.favoriteSpots) })}
                ` : ''}
                ${isAccommodation ? `
                    ${item.pricePerNight !== 'N/A' ? detailRow({ icon: '<', label: 'Per Night', value: item.pricePerNight }) : ''}
                    ${item.packageDetails !== 'N/A' ? detailRow({ icon: '=�', label: 'Packages', value: item.packageDetails }) : ''}
                    ${item.hourlyRate !== 'N/A' ? detailRow({ icon: '=R', label: 'Hourly', value: item.hourlyRate }) : ''}
                    ${detailRow({ icon: '=', label: 'Check-in/out', value: item.checkInCheckOutTimes })}
                    ${detailRow({ icon: '=�', label: 'Amenities', value: renderList(item.amenities) })}
                ` : ''}
            </div>
            ${item.travelTips && item.travelTips.length > 0 ? `
                <div class="card-tips">
                    <h4 class="card-tips-title"><span>=�</span> Travel Tips</h4>
                    <ul>${item.travelTips.map(tip => `<li>${tip}</li>`).join('')}</ul>
                </div>
            ` : ''}
        </div>
    `;
}

function TabsHTML(tabs) {
    return `
        <div class="tabs">
            <div class="tabs-nav">
                ${tabs.map((tab, index) => `<button data-tab-index="${index}" class="tab-button ${index === 0 ? 'active' : ''}">${tab.title}</button>`).join('')}
            </div>
            <div class="tab-content">
                ${tabs[0].content}
            </div>
        </div>
    `;
}

function ResultsDisplayHTML(suggestions) {
    if (suggestions.placesToVisit?.length === 0 && suggestions.foodToTry?.length === 0) {
        return ClimateAdviceHTML(suggestions);
    }
    const groupPlacesByType = (places) => places.reduce((acc, place) => {
        const type = place.type || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(place);
        return acc;
    }, {});

    const groupedPlaces = groupPlacesByType(suggestions.placesToVisit);
    const placesContent = `
        <div class="section">
            ${Object.entries(groupedPlaces).map(([type, places]) => `
                <div>
                    <h3 class="section-title">${type}</h3>
                    <div class="results-grid">
                        ${places.map(item => SuggestionCardHTML(item)).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    const foodContent = `<div class="results-grid">${suggestions.foodToTry.map(item => SuggestionCardHTML(item)).join('')}</div>`;
    const accommodationContent = `<div class="results-grid">${suggestions.accommodationSuggestions.map(item => SuggestionCardHTML({ ...item, name: item.type })).join('')}</div>`;

    const tabs = [
        { title: "Must Visit Places", content: placesContent },
        { title: "Must Try Foods", content: foodContent },
        { title: "Stays", content: accommodationContent },
    ];
    window.TABS_DATA = tabs; // Store for event handlers

    return `
        <div class="section animate-fade-in">
            ${ClimateAdviceHTML(suggestions)}
            ${suggestions.destinationInfo ? DestinationInfoHTML({ info: suggestions.destinationInfo }) : ''}
            ${suggestions.dayByDayPlan?.length > 0 ? DayByDayPlanHTML({ plan: suggestions.dayByDayPlan }) : ''}
            ${TabsHTML(tabs)}
        </div>
    `;
}

// --- RENDER LOGIC ---
function render() {
  const root = document.getElementById('root');
  const { form, isLoading, error, suggestions } = state;
  
  let resultsContent = '';
  if (isLoading) {
    resultsContent = LoadingSpinnerHTML();
  } else if (error) {
    resultsContent = ErrorMessageHTML(error);
  } else if (suggestions) {
    resultsContent = ResultsDisplayHTML(suggestions);
  } else {
    resultsContent = WelcomeMessageHTML();
  }

  root.innerHTML = `
    <div class="container">
        ${HeaderHTML()}
        <main class="main-content">
            ${TravelFormHTML(form)}
            <div class="results-container">
                ${resultsContent}
            </div>
        </main>
    </div>
  `;
  
  const button = document.getElementById('form-submit-button');
  if(button) {
      button.disabled = isLoading;
      button.textContent = isLoading ? 'Generating...' : 'Get Suggestions';
  }
  
  addEventListeners();
  // After a re-render that includes the accordion, make sure the first item is open
  if (suggestions && suggestions.dayByDayPlan?.length > 0) {
      const firstAccordionButton = document.querySelector('.accordion-button');
      const firstAccordionContent = document.querySelector('.accordion-content');
      if (firstAccordionButton && firstAccordionContent) {
          firstAccordionContent.style.maxHeight = firstAccordionContent.scrollHeight + "px";
      }
  }
}

// --- EVENT LISTENERS & HANDLERS ---
function addEventListeners() {
    document.getElementById('travel-form')?.addEventListener('submit', handleSubmit);
    
    ['destination', 'budget', 'travelMonth', 'tripDuration'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', handleFormChange);
    });

    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', handleAccordionToggle);
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
}

function handleFormChange(e) {
  const { name, value } = e.target;
  state.form[name] = name === 'tripDuration' ? parseInt(value, 10) || 0 : value;
}

async function handleSubmit(e) {
  e.preventDefault();
  if (!state.form.destination) {
    state.error = "Please enter a destination.";
    render();
    return;
  }
  state.isLoading = true;
  state.error = null;
  state.suggestions = null;
  render();

  try {
    const result = await getTravelSuggestions(state.form);
    state.suggestions = result;
  } catch (err) {
    console.error(err);
    state.error = err.message;
  } finally {
    state.isLoading = false;
    render();
  }
}

function handleAccordionToggle(e) {
    const button = e.currentTarget;
    const content = button.nextElementSibling;
    const isExpanded = button.getAttribute('aria-expanded') === 'true';

    button.setAttribute('aria-expanded', !isExpanded);
    if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + "px";
    } else {
        content.style.maxHeight = "0px";
    }
}

function handleTabClick(e) {
    const clickedButton = e.currentTarget;
    const tabIndex = parseInt(clickedButton.dataset.tabIndex, 10);
    
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    
    document.querySelector('.tab-content').innerHTML = window.TABS_DATA[tabIndex].content;
}


// --- API SERVICE LOGIC ---
const responseSchema = {"type":"OBJECT","properties":{"destinationInfo":{"type":"OBJECT","properties":{"about":{"type":"STRING"},"history":{"type":"STRING"},"localSpecialty":{"type":"STRING"}}},"isGoodTimeToVisit":{"type":"BOOLEAN"},"reasoning":{"type":"STRING"},"bestTimeToVisit":{"type":"STRING"},"dayByDayPlan":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"day":{"type":"INTEGER"},"title":{"type":"STRING"},"theme":{"type":"STRING"},"schedule":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"time":{"type":"STRING"},"activity":{"type":"STRING"},"description":{"type":"STRING"}}}}}}},"placesToVisit":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"name":{"type":"STRING"},"description":{"type":"STRING"},"type":{"type":"STRING"},"entryFee":{"type":"STRING"},"openingHours":{"type":"STRING"},"bestTimeToVisit":{"type":"STRING"},"modeOfTransport":{"type":"STRING"},"nearestPetrolStation":{"type":"STRING"},"nearbyAttractions":{"type":"ARRAY","items":{"type":"STRING"}},"travelTips":{"type":"ARRAY","items":{"type":"STRING"}}}}},"foodToTry":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"name":{"type":"STRING"},"description":{"type":"STRING"},"estimatedCost":{"type":"STRING"},"favoriteSpots":{"type":"ARRAY","items":{"type":"STRING"}},"dietaryInformation":{"type":"STRING"},"mustTryAt":{"type":"STRING"},"popularTimes":{"type":"STRING"},"servingSuggestion":{"type":"STRING"},"travelTips":{"type":"ARRAY","items":{"type":"STRING"}}}}},"accommodationSuggestions":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"type":{"type":"STRING"},"description":{"type":"STRING"},"pricePerNight":{"type":"STRING"},"packageDetails":{"type":"STRING"},"hourlyRate":{"type":"STRING"},"amenities":{"type":"ARRAY","items":{"type":"STRING"}},"checkInCheckOutTimes":{"type":"STRING"},"travelTips":{"type":"ARRAY","items":{"type":"STRING"}}}}}}};
function generatePrompt(formState) { return `You are an expert travel consultant AI for destinations within India only. Your task is to generate a personalized and highly detailed travel plan based on the user's preferences. If the user enters a location outside of India, you MUST respond with a JSON where 'reasoning' politely explains this limitation and all other fields, especially arrays, are empty. User Preferences: - Destination: ${formState.destination} - Budget: ${formState.budget} - Travel Month: ${formState.travelMonth} - Trip Duration: ${formState.tripDuration} days. Instructions: 1. First, provide general information about the destination ('destinationInfo'). 2. Analyze the climate and determine if it's a good time to visit. 3. Generate lists of suggestions for 'placesToVisit', 'foodToTry', and 'accommodationSuggestions' based on the detailed instructions below. 4. CRITICAL: After generating the suggestion lists, create a cohesive and logical 'dayByDayPlan' for the exact number of days in 'Trip Duration'. This plan MUST integrate the items from your generated 'placesToVisit' and 'foodToTry' lists. Structure the days logically (e.g., group nearby attractions). 5. The number of suggestions for 'placesToVisit' and 'foodToTry' MUST be based on the trip duration: - 1-3 days: Suggest exactly 3 of each. - 4-6 days: Suggest exactly 5 of each. - 7 or more days: Suggest exactly 7 of each. 6. Provide exactly 3 suggestions for 'accommodationSuggestions', tailored to the user's budget. 7. For 'placesToVisit', include detailed information: 'openingHours', 'bestVisitTime', 'entryFee' in INR, the most recommended 'modeOfTransport', 'nearestPetrolStation', 'nearbyAttractions', and 2-3 actionable 'travelTips'. 8. For 'foodToTry', include 'estimatedCost' in INR, 'favoriteSpots', 'dietaryInformation', a 'mustTryAt' recommendation, 'popularTimes', 'servingSuggestion', and 2-3 actionable 'travelTips'. 9. For 'accommodationSuggestions', provide 'pricePerNight' in INR, 'packageDetails', 'hourlyRate', key 'amenities', 'checkInCheckOutTimes', and 2-3 actionable 'travelTips'. Use "N/A" if not applicable. 10. The budget levels mean: - 'Budget': Free activities, street food, hostels/guesthouses. - 'Mid-Range': Moderately priced attractions, local restaurants, 3-4 star hotels. - 'Luxury': Exclusive experiences, fine dining, 5-star hotels/resorts. 11. Your entire response MUST be in a valid JSON format that adheres to the provided schema. Do not include any text or markdown formatting outside of the JSON structure.`; }

async function getTravelSuggestions(formState) {
  // IMPORTANT: PASTE YOUR GOOGLE AI STUDIO API KEY IN THE LINE BELOW
  const apiKey = "AIzaSyAZ5LCBVtDZmWp_WQadiXC3pJX4INviimg";

  if (apiKey === "YOUR_API_KEY_HERE" || !apiKey) {
    throw new Error("API Key not found. Please edit script.js and add your key.");
  }
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ parts: [{ text: generatePrompt(formState) }] }], generationConfig: { responseMimeType: "application/json", responseSchema: responseSchema } };

  try {
    const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) { 
        const errorData = await response.json(); 
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`); 
    }
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching travel suggestions:", error);
    throw new Error("Failed to get suggestions. Check your API Key, destination, or try again later.");
  }
}

// --- INITIAL RENDER ---
document.addEventListener('DOMContentLoaded', render);

