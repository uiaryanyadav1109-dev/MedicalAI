/**
 * Comprehensive Geographic Hierarchy Dataset
 * Country -> State / Province -> District / City / County
 */

import { ALL_COUNTRIES } from './countries';

export interface StateGeoInfo {
  name: string;
  districts: string[];
}

export interface CountryGeoConfig {
  country: string;
  stateLabel: string;
  districtLabel: string;
  districtPlaceholder: string;
  postalCodeLabel: string;
  postalCodePlaceholder: string;
  states: StateGeoInfo[];
}

export const GEOGRAPHIC_DATA: Record<string, CountryGeoConfig> = {
  India: {
    country: 'India',
    stateLabel: 'State / UT',
    districtLabel: 'District',
    districtPlaceholder: 'Select or type district (e.g. Mumbai / Pune)',
    postalCodeLabel: 'PIN Code',
    postalCodePlaceholder: 'e.g. 400001',
    states: [
      {
        name: 'Maharashtra',
        districts: [
          'Mumbai City', 'Mumbai Suburban', 'Pune', 'Thane', 'Nagpur', 'Nashik',
          'Chhatrapati Sambhajinagar', 'Kolhapur', 'Solapur', 'Raigad', 'Palghar',
          'Jalgaon', 'Amravati', 'Nanded', 'Satara', 'Ahmednagar', 'Sangli',
          'Latur', 'Dhule', 'Akola', 'Chandrapur', 'Parbhani', 'Jalna', 'Buldhana',
          'Yavatmal', 'Osmanabad', 'Nandurbar', 'Wardha', 'Bhandara', 'Gondia', 'Gadchiroli', 'Beed', 'Hingoli', 'Washim', 'Ratnagiri', 'Sindhudurg'
        ]
      },
      {
        name: 'Delhi (NCT)',
        districts: [
          'New Delhi', 'Central Delhi', 'North Delhi', 'South Delhi', 'West Delhi',
          'East Delhi', 'North West Delhi', 'South West Delhi', 'North East Delhi',
          'South East Delhi', 'Shahdara'
        ]
      },
      {
        name: 'Karnataka',
        districts: [
          'Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Dakshina Kannada (Mangaluru)',
          'Dharwad (Hubballi)', 'Belagavi', 'Kalaburagi', 'Udupi', 'Tumakuru',
          'Ballari', 'Davanagere', 'Shivamogga', 'Hassan', 'Mandya', 'Bidar',
          'Raichur', 'Bagalkote', 'Vijayapura', 'Chitradurga', 'Kolar', 'Chikkamagaluru', 'Chikkaballapur', 'Koppal', 'Gadag', 'Haveri', 'Yadgir', 'Ramanagara', 'Kodagu', 'Uttara Kannada', 'Chamarajanagar'
        ]
      },
      {
        name: 'Tamil Nadu',
        districts: [
          'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
          'Chengalpattu', 'Kanchipuram', 'Vellore', 'Tirunelveli', 'Erode',
          'Tiruppur', 'Thanjavur', 'Dindigul', 'Cuddalore', 'Kanyakumari',
          'Thoothukudi', 'Ranipet', 'Tiruvallur', 'Tiruvannamalai', 'Villupuram', 'Krishnagiri', 'Dharmapuri', 'Namakkal', 'Karur', 'Sivaganga', 'Pudukkottai', 'Ramanathapuram', 'Virudhunagar', 'Tenkasi', 'Theni', 'Nilgiris', 'Nagapattinam', 'Tiruvarur', 'Mayiladuthurai', 'Kallakurichi', 'Tirupathur'
        ]
      },
      {
        name: 'Telangana',
        districts: [
          'Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri', 'Warangal',
          'Sangareddy', 'Nizamabad', 'Karimnagar', 'Khammam', 'Mahbubnagar',
          'Nalgonda', 'Siddipet', 'Suryapet', 'Jagtial', 'Mancherial', 'Peddapalli', 'Bhadradri Kothagudem', 'Kamareddy', 'Adilabad', 'Wanaparthy', 'Nagarkurnool', 'Jogulamba Gadwal', 'Vikarabad', 'Medak', 'Jangaon', 'Yadadri Bhuvanagiri', 'Mahabubabad', 'Mulugu', 'Narayanpet', 'Komaram Bheem', 'Jayashankar Bhupalpally', 'Rajanna Sircilla', 'Nirmal'
        ]
      },
      {
        name: 'Gujarat',
        districts: [
          'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar',
          'Gandhinagar', 'Jamnagar', 'Junagadh', 'Anand', 'Bharuch',
          'Kutch', 'Mehsana', 'Navsari', 'Valsad', 'Patan', 'Banaskantha', 'Sabarkantha', 'Aravalli', 'Mahisagar', 'Panchmahal', 'Dahod', 'Kheda', 'Chhota Udaipur', 'Narmada', 'Tapi', 'Dang', 'Surendranagar', 'Morbi', 'Amreli', 'Gir Somnath', 'Botad', 'Porbandar', 'Devbhumi Dwarka'
        ]
      },
      {
        name: 'Uttar Pradesh',
        districts: [
          'Lucknow', 'Kanpur Nagar', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad',
          'Varanasi', 'Prayagraj', 'Agra', 'Meerut', 'Bareilly', 'Aligarh',
          'Moradabad', 'Gorakhpur', 'Saharanpur', 'Jhansi', 'Mathura', 'Ayodhya',
          'Muzaffarnagar', 'Firozabad', 'Shahjahanpur', 'Budaun', 'Rampur', 'Bulandshahr', 'Hapur', 'Sambhal', 'Baghpat', 'Pilibhit', 'Hardoi', 'Lakhimpur Kheri', 'Sitapur', 'Unnao', 'Rae Bareli', 'Amethi', 'Sultanpur', 'Barabanki', 'Gonda', 'Bahraich', 'Balrampur', 'Shravasti', 'Basti', 'Sant Kabir Nagar', 'Siddharthnagar', 'Deoria', 'Kushinagar', 'Maharajganj', 'Azamgarh', 'Mau', 'Ballia', 'Jaunpur', 'Ghazipur', 'Chandauli', 'Mirzapur', 'Sonbhadra', 'Bhadohi', 'Banda', 'Chitrakoot', 'Hamirpur', 'Mahoba', 'Jalaun', 'Lalitpur', 'Farrukhabad', 'Kannauj', 'Etawah', 'Auraiya', 'Mainpuri', 'Etah', 'Kasganj', 'Hathras', 'Kaushambi', 'Fatehpur', 'Pratapgarh'
        ]
      },
      {
        name: 'West Bengal',
        districts: [
          'Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah',
          'Hooghly', 'Paschim Bardhaman', 'Purba Bardhaman', 'Darjeeling',
          'Nadia', 'Malda', 'Murshidabad', 'Jalpaiguri', 'Alipurduar', 'Cooch Behar',
          'Kalimpong', 'Uttar Dinajpur', 'Dakshin Dinajpur', 'Bankura', 'Purulia', 'Birbhum', 'Jhargram', 'Paschim Medinipur', 'Purba Medinipur'
        ]
      },
      {
        name: 'Rajasthan',
        districts: [
          'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer',
          'Alwar', 'Bhilwara', 'Sikar', 'Bharatpur', 'Pali', 'Sri Ganganagar',
          'Barmer', 'Chittorgarh', 'Nagaur', 'Churu', 'Jhunjhunu', 'Dausa', 'Tonk', 'Bundi', 'Jhalawar', 'Baran', 'Banswara', 'Dungarpur', 'Pratapgarh', 'Rajsamand', 'Sirohi', 'Jalore', 'Jaisalmer', 'Hanumangarh', 'Sawai Madhopur', 'Karauli', 'Dholpur'
        ]
      },
      {
        name: 'Kerala',
        districts: [
          'Ernakulam (Kochi)', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur',
          'Malappuram', 'Kollam', 'Palakkad', 'Kannur', 'Alappuzha',
          'Kottayam', 'Idukki', 'Wayanad', 'Kasaragod', 'Pathanamthitta'
        ]
      },
      {
        name: 'Punjab',
        districts: [
          'Ludhiana', 'Amritsar', 'Jalandhar', 'SAS Nagar (Mohali)', 'Patiala',
          'Bathinda', 'Hoshiarpur', 'Pathankot', 'Moga', 'Firozpur',
          'Faridkot', 'Kapurthala', 'Sangrur', 'Barnala', 'Fazilka', 'Gurdaspur', 'Tarn Taran', 'Rupnagar', 'Fatehgarh Sahib', 'Mansa', 'Muktsar', 'Malerkotla'
        ]
      },
      {
        name: 'Haryana',
        districts: [
          'Gurugram', 'Faridabad', 'Panipat', 'Ambala', 'Karnal',
          'Sonipat', 'Rohtak', 'Hisar', 'Panchkula', 'Yamunanagar',
          'Kurukshetra', 'Sirsa', 'Bhiwani', 'Rewari', 'Jhajjar', 'Jind', 'Kaithal', 'Fatehabad', 'Palwal', 'Mahendragarh', 'Charkhi Dadri', 'Nuh'
        ]
      },
      {
        name: 'Bihar',
        districts: [
          'Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga',
          'Purnia', 'Nalanda (Bihar Sharif)', 'Begusarai', 'Saran (Chapra)', 'Samastipur',
          'Rohtas (Sasaram)', 'Bhojpur (Ara)', 'Vaishali (Hajipur)', 'Siwan', 'Gopalganj', 'East Champaran (Motihari)', 'West Champaran (Bettiah)', 'Madhubani', 'Saharsa', 'Katihar', 'Munger', 'Sitamarhi'
        ]
      },
      {
        name: 'Madhya Pradesh',
        districts: [
          'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain',
          'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa',
          'Chhindwara', 'Morena', 'Bhind', 'Shivpuri', 'Khandwa', 'Khargone', 'Hoshangabad (Narmadapuram)', 'Sehore', 'Vidisha', 'Betul', 'Balaghat', 'Singrauli'
        ]
      },
      {
        name: 'Andhra Pradesh',
        districts: [
          'Visakhapatnam', 'NTR (Vijayawada)', 'Guntur', 'Tirupati',
          'Kurnool', 'Nellore', 'Kakinada', 'YSR Kadapa', 'Anantapur',
          'Vizianagaram', 'East Godavari (Rajahmundry)', 'West Godavari (Bhimavaram)', 'Eluru', 'Krishna (Machilipatnam)', 'Prakasam (Ongole)', 'Srikakulam', 'Chittoor', 'Annamayya', 'Sri Sathya Sai', 'Nandyal', 'Alluri Sitharama Raju', 'Anakapalli', 'Konavaseema', 'Palnadu', 'Bapatla'
        ]
      },
      {
        name: 'Odisha',
        districts: [
          'Khordha (Bhubaneswar)', 'Cuttack', 'Sundargarh (Rourkela)', 'Puri',
          'Ganjam (Berhampur)', 'Sambalpur', 'Balasore', 'Bhadrak', 'Angul',
          'Jajpur', 'Kendrapara', 'Mayurbhanj (Baripada)', 'Bargarh', 'Jharsuguda', 'Rayagada', 'Koraput', 'Kalahandi', 'Balangir', 'Dhenkanal', 'Keonjhar'
        ]
      },
      {
        name: 'Assam',
        districts: [
          'Kamrup Metropolitan (Guwahati)', 'Dibrugarh', 'Cachar (Silchar)',
          'Jorhat', 'Nagaon', 'Tinsukia', 'Sonitpur (Tezpur)', 'Kamrup',
          'Barpeta', 'Bongaigaon', 'Goalpara', 'Karimganj', 'Golaghat', 'Sivasagar', 'Darrang', 'Morigaon', 'Kokrajhar', 'Dhubri'
        ]
      },
      {
        name: 'Jharkhand',
        districts: [
          'Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro',
          'Hazaribagh', 'Deoghar', 'Ramgarh', 'Giridih', 'Palamu',
          'West Singhbhum (Chaibasa)', 'Dumka', 'Koderma', 'Chatra', 'Godda', 'Sahebganj', 'Garhwa'
        ]
      },
      {
        name: 'Chhattisgarh',
        districts: [
          'Raipur', 'Durg (Bhilai)', 'Bilaspur', 'Korba', 'Rajnandgaon',
          'Raigarh', 'Jagdalpur (Bastar)', 'Surguja (Ambikapur)', 'Dhamtari',
          'Mahasamund', 'Janjgir-Champa', 'Kanker', 'Kabirdham (Kawardha)', 'Balod', 'Bemetara', 'Baloda Bazar'
        ]
      },
      {
        name: 'Uttarakhand',
        districts: [
          'Dehradun', 'Haridwar', 'Nainital (Haldwani)', 'Udham Singh Nagar (Rudrapur)',
          'Almora', 'Pauri Garhwal', 'Tehri Garhwal', 'Chamoli', 'Pithoragarh', 'Uttarkashi', 'Rudraprayag', 'Champawat', 'Bageshwar'
        ]
      },
      {
        name: 'Himachal Pradesh',
        districts: [
          'Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan', 'Kullu',
          'Sirmaur (Nahan)', 'Una', 'Hamirpur', 'Bilaspur', 'Chamba', 'Kinnaur', 'Lahaul and Spiti'
        ]
      },
      {
        name: 'Goa',
        districts: ['North Goa (Panaji)', 'South Goa (Margao)']
      },
      {
        name: 'Jammu & Kashmir',
        districts: [
          'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Udhampur',
          'Kathua', 'Pulwama', 'Budgam', 'Kupwara', 'Rajouri', 'Poonch', 'Reasi', 'Samba', 'Ganderbal', 'Bandipora', 'Kulgam', 'Shopian', 'Doda', 'Ramban', 'Kishtwar'
        ]
      },
      {
        name: 'Ladakh',
        districts: ['Leh', 'Kargil']
      },
      {
        name: 'Chandigarh',
        districts: ['Chandigarh (Union Territory)']
      },
      {
        name: 'Puducherry',
        districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam']
      },
      {
        name: 'Tripura',
        districts: ['West Tripura (Agartala)', 'Gomati (Udaipur)', 'South Tripura', 'North Tripura', 'Dhalai', 'Khowai', 'Sepahijala', 'Unakoti']
      },
      {
        name: 'Meghalaya',
        districts: ['East Khasi Hills (Shillong)', 'West Garo Hills (Tura)', 'Ri-Bhoi (Nongpoh)', 'West Khasi Hills', 'South West Khasi Hills', 'East Jaintia Hills', 'West Jaintia Hills (Jowai)']
      },
      {
        name: 'Manipur',
        districts: ['Imphal West', 'Imphal East', 'Churachandpur', 'Thoubal', 'Bishnupur', 'Senapati', 'Ukhrul', 'Kangpokpi', 'Kakching']
      },
      {
        name: 'Nagaland',
        districts: ['Kohima', 'Dimapur', 'Mokokchung', 'Wokha', 'Mon', 'Tuensang', 'Zunheboto', 'Phek', 'Chümoukedima']
      },
      {
        name: 'Mizoram',
        districts: ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip', 'Mamit', 'Lawngtlai', 'Siaha']
      },
      {
        name: 'Arunachal Pradesh',
        districts: ['Papum Pare (Itanagar)', 'Changlang', 'West Kameng', 'East Siang (Pasighat)', 'Tawang', 'Lohit', 'Lower Subansiri', 'Namsai', 'Upper Siang']
      },
      {
        name: 'Sikkim',
        districts: ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Pakyong', 'Soreng']
      },
      {
        name: 'Andaman & Nicobar Islands',
        districts: ['South Andaman (Port Blair)', 'North & Middle Andaman', 'Nicobar']
      },
      {
        name: 'Dadra & Nagar Haveli and Daman & Diu',
        districts: ['Daman', 'Diu', 'Dadra & Nagar Haveli (Silvassa)']
      },
      {
        name: 'Lakshadweep',
        districts: ['Kavaratti', 'Agatti', 'Andrott', 'Minicoy', 'Amini']
      }
    ]
  },

  'United States': {
    country: 'United States',
    stateLabel: 'State',
    districtLabel: 'City / County',
    districtPlaceholder: 'Select or type city (e.g. Los Angeles / San Francisco)',
    postalCodeLabel: 'ZIP Code',
    postalCodePlaceholder: 'e.g. 90210',
    states: [
      {
        name: 'California',
        districts: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose', 'Sacramento', 'Fresno', 'Long Beach', 'Oakland', 'Anaheim', 'Bakersfield', 'Riverside', 'Irvine', 'Santa Clara', 'Pasadena', 'Fremont', 'Sunnyvale']
      },
      {
        name: 'New York',
        districts: ['New York City (Manhattan)', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'White Plains', 'New Rochelle', 'Ithaca']
      },
      {
        name: 'Texas',
        districts: ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Lubbock', 'Irving', 'Frisco', 'McKinney']
      },
      {
        name: 'Florida',
        districts: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg', 'Fort Lauderdale', 'Tallahassee', 'Hialeah', 'Gainesville', 'Sarasota', 'Boca Raton', 'Cape Coral', 'Naples']
      },
      {
        name: 'Illinois',
        districts: ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Champaign', 'Evanston', 'Schaumburg']
      },
      {
        name: 'Washington',
        districts: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Redmond', 'Kirkland', 'Olympia']
      },
      {
        name: 'Massachusetts',
        districts: ['Boston', 'Cambridge', 'Worcester', 'Springfield', 'Lowell', 'Brockton', 'Quincy', 'Lynn', 'Newton', 'Somerville', 'Waltham']
      },
      {
        name: 'New Jersey',
        districts: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge', 'Lakewood', 'Toms River', 'Trenton', 'Princeton', 'Hoboken']
      },
      {
        name: 'Georgia',
        districts: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Alpharetta', 'Marietta']
      },
      {
        name: 'Pennsylvania',
        districts: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Reading', 'Erie', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg', 'State College']
      },
      {
        name: 'North Carolina',
        districts: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'Asheville', 'Chapel Hill']
      },
      {
        name: 'Ohio',
        districts: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Canton', 'Youngstown', 'Dublin']
      },
      {
        name: 'Michigan',
        districts: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Troy']
      },
      {
        name: 'Virginia',
        districts: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Arlington', 'Fairfax']
      },
      {
        name: 'Colorado',
        districts: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Boulder', 'Westminster']
      },
      {
        name: 'Arizona',
        districts: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise']
      },
      {
        name: 'District of Columbia',
        districts: ['Washington D.C. (NW)', 'Washington D.C. (NE)', 'Washington D.C. (SW)', 'Washington D.C. (SE)', 'Capitol Hill', 'Georgetown']
      }
    ]
  },

  'United Kingdom': {
    country: 'United Kingdom',
    stateLabel: 'Country / Region',
    districtLabel: 'City / Borough / County',
    districtPlaceholder: 'Select or type city/borough (e.g. Westminster / Manchester)',
    postalCodeLabel: 'Postcode',
    postalCodePlaceholder: 'e.g. SW1A 1AA',
    states: [
      {
        name: 'Greater London',
        districts: [
          'City of London', 'City of Westminster', 'Camden', 'Greenwich', 'Hackney',
          'Hammersmith and Fulham', 'Islington', 'Kensington and Chelsea', 'Southwark',
          'Tower Hamlets', 'Wandsworth', 'Barnet', 'Brent', 'Bromley', 'Croydon',
          'Ealing', 'Enfield', 'Haringey', 'Harrow', 'Havering', 'Hillingdon', 'Hounslow', 'Kingston upon Thames', 'Lambeth', 'Lewisham', 'Newham', 'Redbridge', 'Richmond upon Thames', 'Waltham Forest'
        ]
      },
      {
        name: 'England',
        districts: [
          'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield',
          'Bristol', 'Newcastle upon Tyne', 'Nottingham', 'Southampton',
          'Oxford', 'Cambridge', 'Brighton and Hove', 'Leicester', 'Coventry',
          'Reading', 'Plymouth', 'Derby', 'Milton Keynes', 'Norwich', 'Exeter', 'Bath', 'York'
        ]
      },
      {
        name: 'Scotland',
        districts: [
          'Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'Inverness',
          'Stirling', 'Perth', 'Dunfermline', 'Paisley', 'East Kilbride', 'Livingston', 'Falkirk'
        ]
      },
      {
        name: 'Wales',
        districts: [
          'Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor',
          'St Davids', 'Bridgend', 'Barry', 'Neath', 'Cwmbran', 'Llanelli'
        ]
      },
      {
        name: 'Northern Ireland',
        districts: [
          'Belfast', 'Derry (Londonderry)', 'Lisburn', 'Newry',
          'Armagh', 'Bangor', 'Craigavon', 'Ballymena', 'Newtownabbey', 'Coleraine'
        ]
      }
    ]
  },

  'United Arab Emirates': {
    country: 'United Arab Emirates',
    stateLabel: 'Emirate',
    districtLabel: 'District / Area',
    districtPlaceholder: 'Select or type area (e.g. Downtown Dubai / Dubai Marina)',
    postalCodeLabel: 'P.O. Box / Postal Code',
    postalCodePlaceholder: 'e.g. 00000 (Optional)',
    states: [
      {
        name: 'Dubai',
        districts: [
          'Downtown Dubai', 'Dubai Marina', 'Deira', 'Bur Dubai', 'Business Bay',
          'Jumeirah', 'Palm Jumeirah', 'JLT (Jumeirah Lakes Towers)', 'Al Barsha',
          'Mirdif', 'Dubai Hills Estate', 'DIFC', 'Al Quoz', 'Jebel Ali', 'Al Karama',
          'Arabian Ranches', 'Al Nahda (Dubai)', 'Al Qusais', 'Motor City', 'Dubai Silicon Oasis'
        ]
      },
      {
        name: 'Abu Dhabi',
        districts: [
          'Corniche', 'Al Reem Island', 'Yas Island', 'Khalifa City', 'Al Khalidiyah',
          'Saadiyat Island', 'Mohammed Bin Zayed City', 'Al Mushrif', 'Al Bateen',
          'Al Karamah', 'Al Maryah Island', 'Masdar City', 'Al Raha Beach', 'Al Ain Central'
        ]
      },
      {
        name: 'Sharjah',
        districts: [
          'Al Majaz', 'Al Nahda (Sharjah)', 'Al Qasimia', 'Muwailih', 'Al Taawun',
          'University City', 'Al Khan', 'Al Rolla', 'Al Yarmook', 'Al Rahmaniya', 'Khor Fakkan'
        ]
      },
      {
        name: 'Ajman',
        districts: ['Ajman Downtown', 'Al Nuaimia', 'Al Rashidiya', 'Al Jurf', 'Al Rawda', 'Al Mowaihat', 'Al Hamidiya', 'Ajman Corniche']
      },
      {
        name: 'Ras Al Khaimah',
        districts: ['Al Nakheel', 'Al Hamra Village', 'Mina Al Arab', 'Al Marjan Island', 'Khuzam', 'Al Dhait', 'Dafan Al Khor']
      },
      {
        name: 'Fujairah',
        districts: ['Fujairah City', 'Al Faseel', 'Mirbah', 'Qidfa', 'Dibba Al-Fujairah']
      },
      {
        name: 'Umm Al Quwain',
        districts: ['Old Town', 'Al Salama', 'Al Raas', 'Al Humrah', 'Umm Al Quwain Marina']
      }
    ]
  },

  Canada: {
    country: 'Canada',
    stateLabel: 'Province / Territory',
    districtLabel: 'City / Municipality',
    districtPlaceholder: 'Select or type city (e.g. Toronto / Vancouver)',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. M5V 2T6',
    states: [
      {
        name: 'Ontario',
        districts: ['Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor', 'Richmond Hill', 'Oakville', 'Burlington', 'Sudbury', 'Barrie', 'Kingston']
      },
      {
        name: 'British Columbia',
        districts: ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Victoria', 'Kelowna', 'Abbotsford', 'Coquitlam', 'Saanich', 'Delta', 'Nanaimo', 'Kamloops', 'North Vancouver']
      },
      {
        name: 'Quebec',
        districts: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Levis', 'Trois-Rivieres', 'Terrebonne']
      },
      {
        name: 'Alberta',
        districts: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove']
      },
      {
        name: 'Manitoba',
        districts: ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Selkirk']
      },
      {
        name: 'Saskatchewan',
        districts: ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton']
      },
      {
        name: 'Nova Scotia',
        districts: ['Halifax', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow', 'Glace Bay']
      },
      {
        name: 'New Brunswick',
        districts: ['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Miramichi', 'Edmundston']
      }
    ]
  },

  Australia: {
    country: 'Australia',
    stateLabel: 'State / Territory',
    districtLabel: 'City / Region',
    districtPlaceholder: 'Select or type city (e.g. Sydney / Melbourne)',
    postalCodeLabel: 'Postcode',
    postalCodePlaceholder: 'e.g. 2000',
    states: [
      {
        name: 'New South Wales',
        districts: ['Sydney', 'Newcastle', 'Central Coast', 'Wollongong', 'Maitland', 'Tweed Heads', 'Wagga Wagga', 'Coffs Harbour', 'Albury', 'Port Macquarie', 'Orange', 'Dubbo', 'Tamworth', 'Bathurst']
      },
      {
        name: 'Victoria',
        districts: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Mildura', 'Warrnambool', 'Traralgon', 'Wodonga', 'Wangarrata', 'Sunbury']
      },
      {
        name: 'Queensland',
        districts: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns', 'Toowoomba', 'Mackay', 'Rockhampton', 'Bundaberg', 'Hervey Bay', 'Gladstone']
      },
      {
        name: 'Western Australia',
        districts: ['Perth', 'Bunbury', 'Geraldton', 'Kalgoorlie', 'Albany', 'Busselton', 'Karratha', 'Broome', 'Port Hedland']
      },
      {
        name: 'South Australia',
        districts: ['Adelaide', 'Mount Gambier', 'Whyalla', 'Murray Bridge', 'Port Lincoln', 'Port Pirie', 'Victor Harbor']
      },
      {
        name: 'Australian Capital Territory',
        districts: ['Canberra Central', 'Belconnen', 'Tuggeranong', 'Gungahlin', 'Woden Valley', 'Weston Creek', 'Molonglo Valley']
      },
      {
        name: 'Tasmania',
        districts: ['Hobart', 'Launceston', 'Devonport', 'Burnie', 'Kingston', 'Ulverstone']
      },
      {
        name: 'Northern Territory',
        districts: ['Darwin', 'Palmerston', 'Alice Springs', 'Katherine', 'Nhulunbuy']
      }
    ]
  },

  Germany: {
    country: 'Germany',
    stateLabel: 'Federal State (Bundesland)',
    districtLabel: 'City / District (Kreis)',
    districtPlaceholder: 'Select or type city (e.g. Berlin / Munich)',
    postalCodeLabel: 'Postcode (PLZ)',
    postalCodePlaceholder: 'e.g. 10115',
    states: [
      {
        name: 'Bavaria (Bayern)',
        districts: ['Munich (München)', 'Nuremberg (Nürnberg)', 'Augsburg', 'Regensburg', 'Ingolstadt', 'Würzburg', 'Fürth', 'Erlangen', 'Bamberg', 'Bayreuth', 'Aschaffenburg']
      },
      {
        name: 'Berlin',
        districts: ['Mitte', 'Charlottenburg-Wilmersdorf', 'Friedrichshain-Kreuzberg', 'Pankow', 'Tempelhof-Schöneberg', 'Neukölln', 'Steglitz-Zehlendorf', 'Spandau', 'Reinickendorf']
      },
      {
        name: 'North Rhine-Westphalia',
        districts: ['Cologne (Köln)', 'Düsseldorf', 'Dortmund', 'Essen', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster', 'Gelsenkirchen', 'Aachen']
      },
      {
        name: 'Baden-Württemberg',
        districts: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg im Breisgau', 'Heidelberg', 'Heilbronn', 'Ulm', 'Pforzheim', 'Reutlingen', 'Esslingen']
      },
      {
        name: 'Hesse (Hessen)',
        districts: ['Frankfurt am Main', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach am Main', 'Hanau', 'Gießen', 'Marburg', 'Fulda']
      },
      {
        name: 'Hamburg',
        districts: ['Hamburg-Mitte', 'Altona', 'Eimsbüttel', 'Hamburg-Nord', 'Wandsbek', 'Bergedorf', 'Harburg']
      },
      {
        name: 'Saxony (Sachsen)',
        districts: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau', 'Plauen', 'Görlitz']
      },
      {
        name: 'Lower Saxony (Niedersachsen)',
        districts: ['Hanover (Hannover)', 'Braunschweig', 'Oldenburg', 'Osnabrück', 'Wolfsburg', 'Göttingen', 'Salzgitter', 'Hildesheim']
      }
    ]
  },

  Singapore: {
    country: 'Singapore',
    stateLabel: 'Region',
    districtLabel: 'District / Planning Area',
    districtPlaceholder: 'Select or type area (e.g. Marina Bay / Orchard)',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. 018956',
    states: [
      {
        name: 'Central Region',
        districts: ['Marina Bay / Downtown Core', 'Orchard', 'Tanjong Pagar', 'River Valley', 'Novena', 'Bukit Merah', 'Queenstown', 'Toa Payoh', 'Kallang', 'Geylang', 'Bishan']
      },
      {
        name: 'East Region',
        districts: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Paya Lebar']
      },
      {
        name: 'North Region',
        districts: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai', 'Lim Chu Kang']
      },
      {
        name: 'North-East Region',
        districts: ['Sengkang', 'Punggol', 'Hougang', 'Ang Mo Kio', 'Serangoon']
      },
      {
        name: 'West Region',
        districts: ['Jurong East', 'Jurong West', 'Clementi', 'Bukit Batok', 'Bukit Panjang', 'Choa Chu Kang', 'Tuas']
      }
    ]
  },

  'Saudi Arabia': {
    country: 'Saudi Arabia',
    stateLabel: 'Province / Region',
    districtLabel: 'City / Municipality',
    districtPlaceholder: 'Select or type city (e.g. Riyadh / Jeddah)',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. 11564',
    states: [
      {
        name: 'Riyadh Province',
        districts: ['Riyadh (Olaya / Downtown)', 'Al Malaz', 'Al Nakheel', 'Al Yasmin', 'Al Sulaimaniyah', 'Al Kharj', 'Diriyah', 'Al Majma\'ah', 'Dawadmi']
      },
      {
        name: 'Makkah Province',
        districts: ['Jeddah (Corniche / Al Balad)', 'Al Rawdah', 'Al Hamra', 'Mecca (Makkah)', 'Taif', 'Rabigh', 'Al Qunfudhah', 'Khulais']
      },
      {
        name: 'Eastern Province',
        districts: ['Dammam', 'Al Khobar', 'Dhahran', 'Jubail', 'Al Ahsa (Hofuf)', 'Qatif', 'Hafr Al-Batin', 'Ras Tanura', 'Khafji']
      },
      {
        name: 'Madinah Province',
        districts: ['Medina (Al Madinah)', 'Yanbu', 'Al Ula', 'Badr', 'Khaybar']
      },
      {
        name: 'Asir Province',
        districts: ['Abha', 'Khamis Mushait', 'Bisha', 'Muhayil Asir', 'Tanomah']
      }
    ]
  },

  France: {
    country: 'France',
    stateLabel: 'Region',
    districtLabel: 'City / Department',
    districtPlaceholder: 'Select or type city (e.g. Paris / Lyon)',
    postalCodeLabel: 'Postal Code',
    postalCodePlaceholder: 'e.g. 75001',
    states: [
      {
        name: 'Île-de-France (Paris Region)',
        districts: ['Paris (1er-20e Arrondissements)', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil', 'Nanterre', 'Créteil', 'Versailles', 'Courbevoie', 'Rueil-Malmaison']
      },
      {
        name: 'Auvergne-Rhône-Alpes',
        districts: ['Lyon', 'Saint-Étienne', 'Grenoble', 'Villeurbanne', 'Clermont-Ferrand', 'Annecy', 'Chambéry', 'Valence', 'Vénissieux']
      },
      {
        name: 'Provence-Alpes-Côte d\'Azur',
        districts: ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Cannes', 'Antibes', 'La Seyne-sur-Mer', 'Hyères']
      },
      {
        name: 'Occitanie',
        districts: ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers', 'Montauban', 'Narbonne', 'Albi', 'Carcassonne']
      },
      {
        name: 'Nouvelle-Aquitaine',
        districts: ['Bordeaux', 'Limoges', 'Poitiers', 'Pau', 'La Rochelle', 'Mérignac', 'Pessac', 'Bayonne', 'Angoulême']
      }
    ]
  }
};

/**
 * Get configured states for any given country.
 * If country is in our detailed dataset, returns list of state names.
 * Otherwise returns empty array (allowing free-form input).
 */
export function getStatesForCountry(countryName: string): string[] {
  const config = GEOGRAPHIC_DATA[countryName];
  if (!config) return [];
  return config.states.map((s) => s.name);
}

/**
 * Get configured districts/cities for a country and state.
 * If state is provided, returns all its districts.
 * If no state is provided or state not found, returns aggregated list of top districts for that country.
 */
export function getDistrictsForState(countryName: string, stateName?: string): string[] {
  const config = GEOGRAPHIC_DATA[countryName];
  if (!config) return [];

  if (stateName) {
    const found = config.states.find(
      (s) => s.name.toLowerCase() === stateName.trim().toLowerCase()
    );
    if (found) return found.districts;
  }

  // Fallback: Aggregate top districts from all states
  const all = new Set<string>();
  config.states.forEach((s) => {
    s.districts.slice(0, 10).forEach((d) => all.add(d));
  });
  return Array.from(all);
}

/**
 * Get field labels and placeholders tailored to the selected country.
 */
export function getCountryFieldConfig(countryName: string) {
  const config = GEOGRAPHIC_DATA[countryName];
  if (config) {
    return {
      stateLabel: config.stateLabel,
      districtLabel: config.districtLabel,
      districtPlaceholder: config.districtPlaceholder,
      postalCodeLabel: config.postalCodeLabel,
      postalCodePlaceholder: config.postalCodePlaceholder,
      hasPredefinedStates: config.states.length > 0
    };
  }

  return {
    stateLabel: 'State / Province / Region',
    districtLabel: 'City / District / Municipality',
    districtPlaceholder: 'Enter your city or district',
    postalCodeLabel: 'Postal / ZIP Code',
    postalCodePlaceholder: 'e.g. 12345',
    hasPredefinedStates: false
  };
}
