import AlibabaDate from "./date";

enum FlightClass {
    ECONOMY = "economy",
    BUSINESS = "business",
    FIRST = "first"
}

enum IATA {
    IKA = "IKA",
    IFN = "IFN",
    YYZ = "YYZ",
    YUL = "YUL",
    YVR = "YVR",
    CDG = "CDG",
    FRA = "FRA",
    MUC = "MUC",
    BCN = "BCN",
    IST = "IST",
    DXB = "DXB",
    LHR = "LHR"
}

interface Itinerary {
    origin: IATA,
    destination: IATA,
    departureDate: AlibabaDate
}

interface MultiCityRequest {
    adult: number,
    child: number,
    infant: number,
    flightClass: FlightClass,
    isMultiCity: boolean,
    itineries: Itinerary[],
    departureDate: AlibabaDate,
    returnDate: AlibabaDate
}

export {MultiCityRequest, Itinerary, IATA, FlightClass};

// const json = {
//     departureDate: 2019-06-21,
//     adult: 4,
//     child: 0,
//     infant: 0,
//     flightClass: business,
//     isMultiCity: true,
//     itineries: [
//     {
//         origin: IKA,
//         destination: BCN,
//         departureDate: 2019-06-21
//     },
//     {
//         origin: BCN,
//         destination: YVR,
//         departureDate: 2019-06-27
//     },
//     {
//         origin: YVR,
//         destination: IKA,
//         departureDate: 2019-07-18
//     }
// ],
//     returnDate: ""
// };