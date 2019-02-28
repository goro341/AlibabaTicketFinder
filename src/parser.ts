import {IATA} from "./interfaces";

interface FlightSegment {
    "origin": IATA,
    "originName": string, // "Imam Khomeini International Airport"
    "originPersian": string, // "امام خمینی"
    "originCityNamePersian": string, // "تهران"
    "originCountryNamePersian": string, // "ایران"
    "destination": IATA,
    "destinationName": string, // "Rhein-Main"
    "destinationPersian": string, // "فرانکفورت"
    "destinationCityNamePersian": string, // "فرانکفورت"
    "destinationCountryNamePersian": string, // "آلمان"
    "marketingCarrier": string, // "LH"
    "marketingCarrierName": string, // "Lufthansa"
    "operatingCarrier": string, // "LH"
    "flightNumber": string, // "601"
    "aircraft": string, // "343"
    "arrivalDateTime": string, //"2019-06-21T05:45:00"
    "departureDateTime": string, //"2019-06-21T02:45:00" TODO: FIX THESE TO BE DATE
    "_Class": string, // "D"
    "stopDurationTotalMin": number,
    "baggage": string[], // ["2 بسته (هر بسته 23 کیلوگرم)"]
    "airlineLogo": string, // "https://cdn.alibaba.ir/static/img/airlines/LH.png"
    "airlineName": string, // "Lufthansa"
    "flightDuration": number, // 330
    "airportChange": boolean, // TODO: IMPORTANT
    "isTrain": boolean,
    "technicalStop": string[],
    "originCityName": string, //"Tehran"
    "originCountryName": string, //"Iran"
    "destinationCityName": string, //"Frankfurt"
    "destinationCountryName": string //"Germany"
}

interface FlightGroup {
    "internalId": string,// "20190620LH601False20190621LH1124False"
    "airlineName": string, //Lufthansa
    "airlineNamePersian": string,
    "origin": IATA,
    "originName": string, // "Imam Khomeini International Airport"
    "originPersian": string, // "امام خمینی"
    "originCityNamePersian": string, // "تهران"
    "destination": IATA,
    "destinationName": string, // "Aeropuerto Transoceanico de Barcelona"
    "destinationPersian": string, // "بارسلونا"
    "destinationCityNamePersian": string, // "بارسلونا"
    "durationMin": number,
    "numberOfStop": number, // TODO: IMPORTANT
    "cabinTypeName": string, // "Business"
    "flightDetails": FlightSegment[],
    "departureDateTime": string, // "2019-06-21T02:45:00" TODO: FIX THESE
    "arrivalDateTime": string, //"2019-06-21T09:35:00"
    "stopDurationTotal": number, //110 TODO: NEED THIS ONE.. TIME IN AIRPORT
    "ancillaryServices": any,
    "originCityName": string, //"Tehran"
    "destinationCityName": string, // "Barcelona"
    "originCountryName": string, //"Iran"
    "destinationCountryName": string //"Spain"
}

interface Price {
    "paxType": number,
    "paxTypeText": string, //"بزرگسال"
    "perPassenger": number, //463540000
    "total": number, //1854160000
    "count": number //4
}

export default interface Proposal {
    "uniqueId": string, // "20190620LH601False20190621LH1124False20190627LH1131False20190627AC6780False20190627AC6638False20190718AC6527False20190719LH600False"
    "isReservable": boolean,
    "providerMetaData": string, //"As"
    "proposalId": string, //"NDc5Mzk2NzIxMi9jZGJjYjI0Ny04MTQ1LTQ1ZmYtODQzNy1jNGY0MTQyODY3MzQ="
    "total": number, // 1854160000
    "totalTax": number, //57644000
    "prices": Price[],
    flightGroups: FlightGroup[];
    "leavingFlightGroup": string,
    "returningFlightGroup": string,
    "isCharter": boolean,
    "isPoint": boolean,
    "unavailableSeat": boolean,
    "isRefundable": boolean,
    "seat": number, // number of tickets you wanna buy at the same time
    "displayIndex": number,
    "totalDurationMinutes": number //3702
}
