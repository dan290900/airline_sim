// Original aircraft depictions from the official airline fleet pages.
const AIRCRAFT_IMAGES = {
  "LH-0": {
    air: "LH",
    type: 0,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202002_LH_A319_LM_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a319-100.html",
  },
  "LH-2": {
    air: "LH",
    type: 2,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202103_LH_A320neo_JA_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a320neo.html",
  },
  "LH-4": {
    air: "LH",
    type: 4,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202103_LH_A321neo_EF_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a321neo.html",
  },
  "LH-7": {
    air: "LH",
    type: 7,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202002_LH_A333_KR_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a330-300.html",
  },
  "LH-8": {
    air: "LH",
    type: 8,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202002_LH_A343_FD_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a340-300.html",
  },
  "LH-10": {
    air: "LH",
    type: 10,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202405_LH_A359_XT_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a350-900.html",
  },
  "LH-11": {
    air: "LH",
    type: 11,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202303_LH_B744_VY_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/boeing-747-400.html",
  },
  "LH-12": {
    air: "LH",
    type: 12,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202304_LH_B748_YC_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/boeing-747-8.html",
  },
  "LH-14": {
    air: "LH",
    type: 14,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202301_LH_B789_PD_l-GE.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/boeing-787-9.html",
  },
  "LH-15": {
    air: "LH",
    type: 15,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202304_LH_A388_MK_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a380-800.html",
  },
  "LX-5": {
    air: "LX",
    type: 5,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/swiss/Swiss_A220-300_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/swiss/airbus-a220-300.html",
  },
  "LX-13": {
    air: "LX",
    type: 13,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/swiss/Swiss_BOEING_777-300ER_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/swiss/boeing-777-300er.html",
  },
  "LX-7": {
    air: "LX",
    type: 7,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/swiss/Swiss_A330-300_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/swiss/airbus-a330-300.html",
  },
  "OS-6": {
    air: "OS",
    type: 6,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/austrian-airlines/201903_Austrian_ERJ195_WD_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/austrian-airlines/embraer-195.html",
  },
  "OS-1": {
    air: "OS",
    type: 1,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/austrian-airlines/202507_AUA_A320-200_BT_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/austrian-airlines/airbus-a320-200.html",
  },
  "OS-16": {
    air: "OS",
    type: 16,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/austrian-airlines/201903_Austrian_B77E_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/austrian-airlines/boeing-777-200er.html",
  },
  "SN-7": {
    air: "SN",
    type: 7,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/brussels/202604_Brussels_A330-300_OO-SFJ_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/brussels-airlines/airbus-a330-300.html",
  },
  "EW-2": {
    air: "EW",
    type: 2,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/eurowings/202604_EW_A320neo_NF_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/eurowings/airbus-a320neo.html",
  },
  "EW-4": {
    air: "EW",
    type: 4,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/eurowings/202604_EW_A321neo_ED_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/eurowings/airbus-a321neo.html",
  },
  "WK-1": {
    air: "WK",
    type: 1,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/edelweiss/WK-A320_232_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/edelweiss/airbus-a320-200.html",
  },
  "WK-10": {
    air: "WK",
    type: 10,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/edelweiss/WK-A359_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/edelweiss/airbus-a350-900.html",
  },
  "EN-6": {
    air: "EN",
    type: 6,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/air-dolomiti/202404_Dolomiti_ERJ195_JY_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/air-dolomiti/embraer-195.html",
  },
  "4Y-7": {
    air: "4Y",
    type: 7,
    image:
      "https://www.discover-airlines.com/content/dam/four_y/images/frontify_variations/6/c-505186089-Discover_A330-300_Motiv_01_RGB.jpg.transform/lh-dcep-transform-width-1440/img.jpg",
    source:
      "https://www.discover-airlines.com/us/en/discover/travel-classes/fleet/a330-300",
  },
  "4Y-1": {
    air: "4Y",
    type: 1,
    image:
      "https://www.discover-airlines.com/content/dam/four_y/images/frontify_variations/6/c-279575264-Discover_A320-200_Motiv_02_RGB.jpg.transform/lh-dcep-transform-width-1440/img.jpg",
    source:
      "https://www.discover-airlines.com/us/en/discover/travel-classes/fleet/a320-200",
  },
  "OS-14": {
    air: "OS",
    type: 14,
    image:
      "https://www.austrian.com/content/dam/aua/images/frontify_variations/7/c-170236775-787.png.transform/lh-dcep-transform-width-1440/img.jpg",
    source: "https://www.austrian.com/at/en/fly/aircraft-fleet/boeing-787",
  },
  "SN-1": {
    air: "SN",
    type: 1,
    image:
      "https://www.brusselsairlines.com/content/dam/bel/images/local_variations/c-1862229288-A320-landingspagina.jpg.transform/lh-dcep-transform-width-1440/img.jpg",
    source:
      "https://www.brusselsairlines.com/xx/en/flying-with-us/our-fleet/airbus-a320",
  },
  "LH-1": {
    air: "LH",
    type: 1,
    image:
      "https://www.lufthansa.com/content/dam/lh/images/local_images/discover-lufthansa/fleet/320/01-airbus-a320-200-header-2560x1440.jpg.transform/lh-dcep-transform-width-1440/img.jpg",
    source: "https://www.lufthansa.com/am/en/320",
  },
  "LH-3": {
    air: "LH",
    type: 3,
    image:
      "https://www.lufthansagroup.com/media/images/unternehmen/flotte/lufthansa/202002_LH_A321_DH_l.png",
    source:
      "https://www.lufthansagroup.com/en/company/fleet/lufthansa-and-regional-partners/airbus-a321-100/200.html",
  },
};
