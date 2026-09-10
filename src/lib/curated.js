export const BLOCK = new Set([
  "a41b606e-d585-4c13-9fa9-ade6c5fe8109", // KNDS (MP3): stream is a Spotify preview loop
  "845448d2-3a08-11e9-9b4e-52543be04c81", // KCPR duplicate
  "594a1496-a018-47e4-bfae-5d49350910ca", // 90.7 The Lion duplicate
  "a256200d-2ec4-11e9-8f31-52543be04c81", // KALX duplicate
  "0d0b8bad-4d41-4c65-a675-ea88823a2d5e", // Radio K duplicate
  "09dc000a-03c2-4147-8f80-e1c765eafcc7", // Radio K duplicate
  "6c01ef1c-a816-4b62-944b-3c61555d5d17", // Radio K duplicate
  "f0ba657a-6351-4e5b-93b1-e8b6f625122f", // Radio K duplicate
  "f7004008-3996-4507-a747-69ea8a40fdc7", // KPCR Pirate Cat: not a college station
  "fb682362-b9de-485f-8670-8514b187226c", // KFJC 32k duplicate of the 320k entry
  "ef8f7ec7-d84d-45f8-bdd5-f3d23f421b39", // KWSC duplicate, same stream
  "239976d3-d46f-4671-991d-f6784abfa454", // WBOR duplicate, same stream
  "7f1c5042-7a97-46bc-96c8-72b8328aa0b4", // "KDST": mislabeled duplicate of KSDT (UCSD)
  "bc0d8979-394e-4e5a-b4a4-22794c5ffb4a", // KTCU duplicate, same stream
  "9f41654e-ed99-40c3-8464-e3f5466612c0", // KURA: K-12 school station, not college
]);

// campus coordinates for stations the directory places badly or not at all
export const PIN = {
  "fbd47272-fdc6-457c-ac93-98410bb4c777": [40.3487, -74.6593], // WPRB Princeton
  "a707f84a-9ae4-40bf-a176-fcb4cdbc9fbe": [42.3592, -71.0935], // WMBR MIT
  "96187adc-0601-11e8-ae97-52543be04c81": [42.3736, -71.119], // WHRB Harvard
  "36f913b6-88ab-4f29-ae89-4ac277047e82": [37.4275, -122.1697], // KZSU Stanford
  "49bf370a-c7d0-45d1-9afa-28efb2067565": [41.7886, -87.5987], // WHPK UChicago
  "7bac7da1-3be9-4688-b610-f02041c82aa8": [42.056, -87.681], // WNUR Northwestern, off the lakefill
  "6a8e0467-f09b-456f-a7af-b98ed961a043": [41.9995, -87.662], // WLUW Loyola Chicago, off the shoreline
  "200fb773-6b90-11ea-b1cf-52543be04c81": [41.8268, -71.4025], // WBRU Brown
  "7f685478-c47f-49d8-861c-1e72c2689f25": [42.4534, -76.4735], // WVBR Cornell
  "a214f12a-609e-491c-890a-7658235150d1": [40.8075, -73.9626], // WKCR Columbia
  "cd17491d-80a2-484f-9e33-75039fa9c617": [34.0689, -118.4452], // UCLA Radio
  "7ed0d055-8856-40da-b747-5b830523083d": [38.9076, -77.0723], // WGTB Georgetown
  "93e94bff-493e-48e3-809d-9a4c9ce6a19b": [38.0336, -78.508], // WXTJ UVA
  "9ff16372-f398-4ae6-93fd-d0d614ebbc18": [42.278, -83.7382], // WCBN Michigan
  "a44129d2-def2-4d18-89c5-03f10db95043": [40.7295, -73.9965], // WNYU
  "962af1a3-0601-11e8-ae97-52543be04c81": [42.4075, -71.119], // WMFO Tufts
  "4af97ba5-4546-4132-a94a-ebca09214cfb": [34.414, -119.8489], // KCSB UCSB
  "e9f8678d-5d4b-47f8-90e7-0e7b7e560346": [43.1284, -77.6285], // WRUR Rochester
  "2768b05d-96a2-4b74-9f92-c0fa7e979eb5": [42.3355, -71.1685], // WZBC Boston College
  "961d858e-0601-11e8-ae97-52543be04c81": [33.6405, -117.8443], // KUCI UC Irvine
  "440269f7-20fd-4442-8e86-6c8251a11bf5": [32.8794, -117.231], // KSDT UCSD, off the 10m shoreline
  "f234e5ee-c3d8-4d75-ba14-53cfe7670340": [38.5382, -121.7617], // KDVS UC Davis
  "960dd86c-0601-11e8-ae97-52543be04c81": [33.7756, -84.3963], // WREK Georgia Tech
  "51f82c18-dc04-44f2-8437-6d734468a257": [30.2849, -97.7341], // KVRX UT Austin
  "71d246d6-cc3b-451f-b1b9-4e421ccc259a": [43.0766, -89.4125], // WSUM Wisconsin
  "32811bda-1a78-40b5-a572-d3e17c055da3": [33.4242, -111.9281], // Blaze Radio ASU
  "96419611-0601-11e8-ae97-52543be04c81": [38.9227, -77.0194], // WHBC Howard
  "4741842f-1607-11e9-a80b-52543be04c81": [40.8734, -123.9358], // KRFH Humboldt
  "53d9ee31-2e4f-42b3-b607-fc87be4dc7b4": [29.7174, -95.4018], // Rice
  "960dd7a5-0601-11e8-ae97-52543be04c81": [39.9522, -75.1932], // WXPN Penn
  "0349022e-c22a-43c8-b1fc-1e51b113c1b4": [44.9723, -93.2408], // Radio K, Rarig Center UMN
  "69382b2e-06f4-4ca0-b0e0-e19ad1f651fa": [29.6516, -82.3248], // WRUF Florida
  "96143628-0601-11e8-ae97-52543be04c81": [37.2296, -80.4139], // WUVT Virginia Tech
  "961ed522-0601-11e8-ae97-52543be04c81": [39.6837, -75.7497], // WVUD Delaware
  "9621a152-0601-11e8-ae97-52543be04c81": [39.6837, -75.7497], // WVUD-HD2 Delaware
  "9624d16e-0601-11e8-ae97-52543be04c81": [37.784, -79.4428], // WLUR Washington & Lee
  "0bae57d2-9392-4b32-8b7e-45f6140ea7a9": [37.5485, -77.4544], // WVCW VCU
  "961c3bbb-0601-11e8-ae97-52543be04c81": [43.0876, -75.2321], // WPNR Utica
  "962d1bb0-0601-11e8-ae97-52543be04c81": [41.2565, -96.0103], // KVNO Nebraska Omaha
  "3f0a0ad0-fa37-11e9-bbf2-52543be04c81": [35.9754, -78.8986], // WNCU NC Central
  "a0b90513-c49a-4f48-884f-0a5d3c452d76": [42.7018, -84.4822], // WDBM Michigan State
  "0a169853-79c2-4ed5-8d31-0419a8404c5c": [40.4444, -79.9608], // WPTS Pittsburgh
  "695e88fb-6e00-4966-98e9-47752f5be5f3": [40.5008, -74.4474], // WRSU Rutgers
  "87a3cba4-c427-11e9-8502-52543be04c81": [41.8077, -72.254], // WHUS UConn
  "961dad7d-0601-11e8-ae97-52543be04c81": [32.603, -85.4873], // WEGL Auburn
  "0c10efeb-eb13-4e2c-af00-c12c43fc9927": [35.9544, -83.9295], // WUTK Tennessee
  "e0982ba5-3a1a-41a0-99a4-38d6cb18cbfa": [38.0382, -84.5054], // WRFL Kentucky
  "03e4e220-dda1-464f-8bba-42e25e144696": [33.9937, -81.0299], // WUSC South Carolina
  "0a320c58-82f7-4fe3-b4c3-0b1dff8d8351": [38.9404, -92.3277], // KCOU Missouri
  "53ef2f0e-5b96-4790-a547-1b57b9d53174": [38.9543, -95.2558], // KJHK Kansas
  "7375ae23-b1f9-45aa-8bbe-f6a26946bacd": [41.6611, -91.5302], // KRUI Iowa
  "9616501c-0601-11e8-ae97-52543be04c81": [44.0448, -123.0726], // KWVA Oregon
  "00cf489b-bdc1-4ff3-8ecb-4cd2a5288820": [44.5638, -123.2794], // KBVR Oregon State
  "0f7467f0-e855-4260-aa59-eb2f695983d5": [40.5734, -105.0865], // KCSU Colorado State
  "503415f7-d850-4b94-879b-4a02ceb735a2": [40.2518, -111.6493], // KBYU BYU
  "e0669706-c87b-468b-9e16-0a344ca63ecf": [29.9346, -90.1223], // WTUL Tulane
  "1d2e078b-63bb-4fa6-a91a-8fbed6e8d69f": [30.4133, -91.18], // KLSU LSU
  "dedd26db-3215-4de4-8941-64d473ebaa5e": [40.8614, -73.8855], // WFUV Fordham
  "b129a55b-257a-47df-bd1c-3889c43aaec7": [40.6069, -75.3783], // WLVR Lehigh
  "6696ce2b-b4b3-4ec3-9824-2a9a8b783360": [42.7298, -73.6789], // WRPI RPI
  "eac151a6-9d8c-4432-a800-c2580f739ac2": [42.3398, -71.0892], // WRBB Northeastern
  "96441004-0601-11e8-ae97-52543be04c81": [39.9566, -75.1899], // WKDU Drexel
  "ddca360a-00e1-4dc5-88d8-9abd86e77118": [41.5043, -81.6084], // WRUW Case Western
  "ffdb9482-bb13-11e9-acb2-52543be04c81": [40.9126, -73.1234], // WUSB Stony Brook
  "2e151b7e-5b8d-4a12-b901-c21890113e99": [42.0888, -75.9686], // WHRW Binghamton
  "9603908f-75cf-4518-9a14-be0a3e0edc0e": [44.4779, -73.1965], // WRUV Vermont
  "9630450a-0601-11e8-ae97-52543be04c81": [43.1389, -70.937], // WUNH New Hampshire
  "395b4665-0898-49c5-9898-c6fbc75c5502": [37.3496, -121.939], // KSCU Santa Clara
  "bb15d622-7137-4269-8f33-71cccb208732": [36.9916, -122.0583], // KZSC UC Santa Cruz
};

export const RENAME = {
  "71d246d6-cc3b-451f-b1b9-4e421ccc259a": "WSUM 91.7 - University of Wisconsin",
  "53d9ee31-2e4f-42b3-b607-fc87be4dc7b4": "KTRU - Rice University Radio",
  "9603908f-75cf-4518-9a14-be0a3e0edc0e": "WRUV 90.1 - University of Vermont",
  "053c5162-c72c-4131-8d10-0d7b115c1df5": "KRNU 90.3 - University of Nebraska-Lincoln",
  "499e5897-8078-4580-ba41-189abef86da7": "KMNR 89.7 - Missouri S&T",
};

// campus city for stations whose name/tags don't yield one (dots are already pinned)
export const CITY = {
  "a707f84a-9ae4-40bf-a176-fcb4cdbc9fbe": "Cambridge",       // WMBR MIT
  "49bf370a-c7d0-45d1-9afa-28efb2067565": "Chicago",         // WHPK UChicago
  "7bac7da1-3be9-4688-b610-f02041c82aa8": "Evanston",        // WNUR Northwestern
  "6a8e0467-f09b-456f-a7af-b98ed961a043": "Chicago",         // WLUW Loyola Chicago
  "200fb773-6b90-11ea-b1cf-52543be04c81": "Providence",      // WBRU Brown
  "7f685478-c47f-49d8-861c-1e72c2689f25": "Ithaca",          // WVBR Cornell
  "a214f12a-609e-491c-890a-7658235150d1": "New York",        // WKCR Columbia
  "cd17491d-80a2-484f-9e33-75039fa9c617": "Los Angeles",     // UCLA Radio
  "7ed0d055-8856-40da-b747-5b830523083d": "Washington",      // WGTB Georgetown
  "9ff16372-f398-4ae6-93fd-d0d614ebbc18": "Ann Arbor",       // WCBN Michigan
  "a44129d2-def2-4d18-89c5-03f10db95043": "New York",        // WNYU
  "4af97ba5-4546-4132-a94a-ebca09214cfb": "Santa Barbara",   // KCSB UCSB
  "e9f8678d-5d4b-47f8-90e7-0e7b7e560346": "Rochester",       // WRUR Rochester
  "2768b05d-96a2-4b74-9f92-c0fa7e979eb5": "Chestnut Hill",   // WZBC Boston College
  "440269f7-20fd-4442-8e86-6c8251a11bf5": "La Jolla",        // KSDT UCSD
  "51f82c18-dc04-44f2-8437-6d734468a257": "Austin",          // KVRX UT Austin
  "71d246d6-cc3b-451f-b1b9-4e421ccc259a": "Madison",         // WSUM Wisconsin
  "32811bda-1a78-40b5-a572-d3e17c055da3": "Tempe",           // Blaze Radio ASU
  "4741842f-1607-11e9-a80b-52543be04c81": "Arcata",          // KRFH Humboldt
  "53d9ee31-2e4f-42b3-b607-fc87be4dc7b4": "Houston",         // KTRU Rice
  "0349022e-c22a-43c8-b1fc-1e51b113c1b4": "Minneapolis",     // Radio K UMN
  "69382b2e-06f4-4ca0-b0e0-e19ad1f651fa": "Gainesville",     // WRUF Florida
  "0bae57d2-9392-4b32-8b7e-45f6140ea7a9": "Richmond",        // WVCW VCU
  "3f0a0ad0-fa37-11e9-bbf2-52543be04c81": "Durham",          // WNCU NC Central
  "0a169853-79c2-4ed5-8d31-0419a8404c5c": "Pittsburgh",      // WPTS Pittsburgh
  "695e88fb-6e00-4966-98e9-47752f5be5f3": "New Brunswick",   // WRSU Rutgers
  "87a3cba4-c427-11e9-8502-52543be04c81": "Storrs",          // WHUS UConn
  "0c10efeb-eb13-4e2c-af00-c12c43fc9927": "Knoxville",       // WUTK Tennessee
  "e0982ba5-3a1a-41a0-99a4-38d6cb18cbfa": "Lexington",       // WRFL Kentucky
  "03e4e220-dda1-464f-8bba-42e25e144696": "Columbia",        // WUSC South Carolina
  "53ef2f0e-5b96-4790-a547-1b57b9d53174": "Lawrence",        // KJHK Kansas
  "7375ae23-b1f9-45aa-8bbe-f6a26946bacd": "Iowa City",       // KRUI Iowa
  "00cf489b-bdc1-4ff3-8ecb-4cd2a5288820": "Corvallis",       // KBVR Oregon State
  "0f7467f0-e855-4260-aa59-eb2f695983d5": "Fort Collins",    // KCSU Colorado State
  "503415f7-d850-4b94-879b-4a02ceb735a2": "Provo",           // KBYU BYU
  "e0669706-c87b-468b-9e16-0a344ca63ecf": "New Orleans",     // WTUL Tulane
  "1d2e078b-63bb-4fa6-a91a-8fbed6e8d69f": "Baton Rouge",     // KLSU LSU
  "dedd26db-3215-4de4-8941-64d473ebaa5e": "Bronx",           // WFUV Fordham
  "b129a55b-257a-47df-bd1c-3889c43aaec7": "Bethlehem",       // WLVR Lehigh
  "6696ce2b-b4b3-4ec3-9824-2a9a8b783360": "Troy",            // WRPI RPI
  "eac151a6-9d8c-4432-a800-c2580f739ac2": "Boston",          // WRBB Northeastern
  "ddca360a-00e1-4dc5-88d8-9abd86e77118": "Cleveland",       // WRUW Case Western
  "ffdb9482-bb13-11e9-acb2-52543be04c81": "Stony Brook",     // WUSB Stony Brook
  "2e151b7e-5b8d-4a12-b901-c21890113e99": "Binghamton",      // WHRW Binghamton
  "9603908f-75cf-4518-9a14-be0a3e0edc0e": "Burlington",      // WRUV Vermont
  "395b4665-0898-49c5-9898-c6fbc75c5502": "Santa Clara",     // KSCU Santa Clara
  "bb15d622-7137-4269-8f33-71cccb208732": "Santa Cruz",      // KZSC UC Santa Cruz
  "manual-kvcu-radio-1190-cu-boulder": "Boulder",            // KVCU CU Boulder
  "manual-wkdt-89-3-united-states-military-academy": "West Point",         // WKDT
  "manual-ktuh-90-3-university-of-hawaii-at-manoa": "Honolulu",            // KTUH
  "manual-ksua-91-5-university-of-alaska-fairbanks": "Fairbanks",          // KSUA
  "manual-krua-88-1-university-of-alaska-anchorage": "Anchorage",          // KRUA
  "053c5162-c72c-4131-8d10-0d7b115c1df5": "Lincoln",                       // KRNU
  "manual-kuwr-91-9-university-of-wyoming": "Laramie",                     // KUWR
  "manual-kgou-106-3-university-of-oklahoma": "Norman",                    // KGOU
  "manual-kunm-89-9-university-of-new-mexico": "Albuquerque",              // KUNM
  "499e5897-8078-4580-ba41-189abef86da7": "Rolla",                         // KMNR
  "manual-kunv-91-5-university-of-nevada-las-vegas": "Las Vegas",          // KUNV
  "manual-wvau-american-university": "Washington",                        // WVAU
  "manual-wwvu-91-7-u92-west-virginia-university": "Morgantown",          // WWVU
  "manual-wvua-90-7-university-of-alabama": "Tuscaloosa",                  // WVUA
  "manual-wrvu-nashville-vanderbilt-university": "Nashville",             // WRVU
};

// school name for stations whose name/tags don't spell it out
export const COLLEGE = {
  "69382b2e-06f4-4ca0-b0e0-e19ad1f651fa": "University of Florida",         // WRUF
  "manual-kvcu-radio-1190-cu-boulder": "University of Colorado Boulder",   // KVCU
  "manual-wkdt-89-3-united-states-military-academy": "United States Military Academy",
  "manual-ktuh-90-3-university-of-hawaii-at-manoa": "University of Hawaii at Manoa",
  "manual-ksua-91-5-university-of-alaska-fairbanks": "University of Alaska Fairbanks",
  "manual-krua-88-1-university-of-alaska-anchorage": "University of Alaska Anchorage",
  "053c5162-c72c-4131-8d10-0d7b115c1df5": "University of Nebraska-Lincoln",
  "manual-kuwr-91-9-university-of-wyoming": "University of Wyoming",
  "manual-kgou-106-3-university-of-oklahoma": "University of Oklahoma",
  "manual-kunm-89-9-university-of-new-mexico": "University of New Mexico",
  "499e5897-8078-4580-ba41-189abef86da7": "Missouri University of Science and Technology",
  "manual-kunv-91-5-university-of-nevada-las-vegas": "University of Nevada, Las Vegas",
  "manual-wvau-american-university": "American University",
  "manual-wwvu-91-7-u92-west-virginia-university": "West Virginia University",
  "manual-wvua-90-7-university-of-alabama": "University of Alabama",
  "manual-wrvu-nashville-vanderbilt-university": "Vanderbilt University",
  // Name has a transposed callsign (WHCL) that falsely matches Hamilton College
  // in NY; this is Chapel Hill's WCHL. No college affiliation -> generic.
  "e6ccbf1c-b258-4090-b04b-b04cf9b5d781": "College radio", // WCHL Chapelboro
};
