import AlibabaDate from "./date";
import {FlightClass, IATA, Itinerary, MultiCityRequest} from "./interfaces";
import {AlibabaRequest} from "./request";
import Proposal from "./parser";
import {applyBiasSorting, filterProposals, printProposalInformation} from "./flightSelector";

export const servers = ["my7", "se221", "se222", "se223", "se224", "se225", "se226", "se227", "se228", "se229", "se230", "se231", "se232"];
    //"se233", "se234", "se235", "se236", "se237", "se238", "se239", "it43", "it44", "it45", "it46", "it47", "cz49", "cr7", "be60", "ba3", "uk449"];//"de250", "de334", "fr231", "us1607"];

interface DayTolerance {
    low: number;
    high: number;
}

interface DepartureDate {
    tolerance: DayTolerance;
    month: number;
    year: number;
}

interface InputTrip {
    earliestDepartureDate: string;
    latestDepartureDate: string;
    departureIATA: string;
    arrivalIATA: string;
}

interface AlibabaInputTrip {
    earliestDepartureDate: AlibabaDate;
    latestDepartureDate: AlibabaDate;
    toleranceDays: number;
    departureIATA: IATA;
    arrivalIATA: IATA;
}

export let counter = 0;

(async () => {

    // HELPERS

    const produceCombinations = (tolerancesList: number[][]): number[][] => {
        const firstToleranceList = tolerancesList[0];
        if (tolerancesList.length == 1) {
            return firstToleranceList.map((item: number) => [item]);
        } else {
            const tempSolutionList: number[][] = [];
            firstToleranceList.forEach((num: number) => tempSolutionList.push(...produceCombinations(tolerancesList.slice(1, tolerancesList.length)).map((arr: number[]) => {arr.unshift(num); return arr;})));
            return tempSolutionList;
        }
    };

    const convertStringDateToAlibabaDate = (stringDate: string) => {
        const dateNumberArray = stringDate.split("-").map((input: string) => Number(input));
        return new AlibabaDate(dateNumberArray[0], dateNumberArray[1], dateNumberArray[2]);
    };


    const convertInputTripToAlibabaInputTrip = (trips: InputTrip[]): AlibabaInputTrip[] => {
        return trips.map((trip: InputTrip) => {
            const earliestAlibabaDepartureDate = convertStringDateToAlibabaDate(trip.earliestDepartureDate);
            const latestAlibabaDepartureDate = convertStringDateToAlibabaDate(trip.latestDepartureDate);
            return {
                earliestDepartureDate: earliestAlibabaDepartureDate,
                latestDepartureDate: latestAlibabaDepartureDate,
                toleranceDays: earliestAlibabaDepartureDate.getAbsoluteDiffDays(latestAlibabaDepartureDate) + 1,
                departureIATA: IATA[trip.departureIATA],
                arrivalIATA: IATA[trip.arrivalIATA]
            };
        });
    };

    //MAIN STARTS FROM HERE
    // APP INPUT:


    //REQUIREMENT : day difference for each trip SHOULD NOT BE GREATER THAN 30 DAYS
    const trips: InputTrip[] = [
        {earliestDepartureDate: "27-06-2019", latestDepartureDate: "01-07-2019", departureIATA: IATA.IKA, arrivalIATA: IATA.BCN},
        {earliestDepartureDate: "04-07-2019", latestDepartureDate: "10-07-2019", departureIATA: IATA.BCN, arrivalIATA: IATA.YVR},
        {earliestDepartureDate: "13-07-2019", latestDepartureDate: "14-07-2019", departureIATA: IATA.YVR, arrivalIATA: IATA.IKA}
    ];
    const flightClass: FlightClass = FlightClass.ECONOMY;
    const numberOfChildren: number = 0;
    const numberOfInfants: number = 0;
    const numberOfAdults: number = 4;

    const alibabaTrips: AlibabaInputTrip[] = convertInputTripToAlibabaInputTrip(trips);

    // const numCombinations = input.reduce((total: number, tolerance: DayTolerance) =>
    //     total * calculateToleranceDays(tolerance), 1);

    const createRequestObject = (alibabaInputTripDate: AlibabaDate[]) => {

        const itineries: Itinerary[] = [];
        for (let index in alibabaInputTripDate) {
            const correspondingAlibabaTrip = alibabaTrips[index];
            const alibabaDate = alibabaInputTripDate[index];
            itineries.push({origin: correspondingAlibabaTrip.departureIATA, destination: correspondingAlibabaTrip.arrivalIATA, departureDate: alibabaDate});
        }

        return {
            departureDate: alibabaInputTripDate[0],
            adult: numberOfAdults,
            child: numberOfChildren,
            infant: numberOfInfants,
            isMultiCity: true,
            flightClass: flightClass,
            itineries: itineries,
            returnDate: ""
        }
    };

    const produceToleranceList = (earliestDay: number, latestDay: number, toleranceDays: number): number[] => {
        const produceList = (earliestDay: number, latestDay: number) => {
            const list = [];
            for (let index = earliestDay; index <= latestDay; index++) {
                list.push(index);
            }
            return list;
        };
        if (latestDay >= earliestDay) {
            return produceList(earliestDay, latestDay);
        } else {
            const resultList = produceList(earliestDay, earliestDay - latestDay + (toleranceDays - 1));
            resultList.push(...produceList(1, latestDay));
            return resultList;
        }
    };

    const combinationInput = alibabaTrips.reduce((total: number[][], currentAlibabaTrip: AlibabaInputTrip) => {
        const earliestDay = currentAlibabaTrip.earliestDepartureDate.getDay();
        const latestDay = currentAlibabaTrip.latestDepartureDate.getDay();
        const toleranceDays = currentAlibabaTrip.toleranceDays;
        let tempArray = total;
        if (total[0].length == 0){
            tempArray = [];
        }
        tempArray.push(produceToleranceList(earliestDay, latestDay, toleranceDays));
        return tempArray;
    }, [[]]);


    const promises: Promise<Proposal[]>[] = [];
    const combinations : number[][] = produceCombinations(combinationInput);
    console.log(`num combinations: ${combinations.length}`);
    combinations.forEach((departureDays: number[]) => {
        const alibabaDepartureDates: AlibabaDate[] = [];
        for (let index = 0; index < departureDays.length; index++) {
            const departureDay = departureDays[index];
            const correspondingAlibabaTrip = alibabaTrips[index];
            let correspondingDate = correspondingAlibabaTrip.latestDepartureDate;
            if (departureDay > correspondingAlibabaTrip.earliestDepartureDate.getDay() && departureDay <= correspondingDate.getDay()) {
                correspondingDate = correspondingAlibabaTrip.earliestDepartureDate;
                // 20 (25) 29
            } else if (departureDay <= correspondingAlibabaTrip.earliestDepartureDate.getDay()) {
                // 20 (3) 8
            } else if (departureDay > correspondingDate.getDay()){
                correspondingDate = correspondingAlibabaTrip.earliestDepartureDate;
                // 20 (25) 4
            }
            alibabaDepartureDates.push(new AlibabaDate(departureDay, correspondingDate.getMonth(), correspondingDate.getFullYear()));
        }

        const alibabaReq = new AlibabaRequest(createRequestObject(alibabaDepartureDates));
        const server = servers[counter++ % servers.length];
        promises.push(alibabaReq.getFinalProposals(server));
    });



    //
    // for (let k = 23; k <= 23; k++) {
    //     const firstDate = AlibabaDate.toString(k, 6, 2019);
    //     for (let j = 27; j <= 27; j++) {
    //         const secondDate = AlibabaDate.toString(j, 6, 2019);
    //         for (let i = 10; i <= 14; i++) {
    //             const thirdDate = AlibabaDate.toString(i, 7, 2019);
    //             const server = servers[counter++ % servers.length];
    //             const reqObject = AlibabaRequest.getRequestObject(firstDate, secondDate, thirdDate, FlightClass.BUSINESS);
    //             const alibabaReq = new AlibabaRequest(reqObject);
    //             promises.push(alibabaReq.getFinalProposals(server));
    //         }
    //     }
    // }
    //

    try {
        const results = await Promise.all(promises);
        let allProposals: Proposal[] = [];
        for (let proposals of results) {
            allProposals.push(...proposals);
        }
        console.log(`Number of  proposals before filtering is applied: ${allProposals.length}`);
        filterProposals(allProposals);
        console.log(`Number of proposals after filtering is applied: ${allProposals.length}`);
        applyBiasSorting(allProposals);
        allProposals = allProposals.slice(0, 15);// get only the first 15 proposals
        allProposals.forEach((proposal: Proposal) => {
            printProposalInformation(proposal);
            console.log("########################");
        });
    } catch (e) {
        console.log(e);
        console.log('in error')
    }

})();


// for a proposal with at least two flight groups
const placeAllSearchRequests = (departuresTolerances: DayTolerance[]) => {

};
