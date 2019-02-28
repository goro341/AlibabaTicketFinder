import Proposal from "./parser";
import {IATA} from "./interfaces";

const printFlightSegments = (proposal: Proposal) => {
    const tab = "\t";
    for (let flightGroup of proposal.flightGroups) {
        console.log(tab + flightGroup.origin + " to " + flightGroup.destination + ", " + minutesToHoursMinutes(flightGroup.durationMin)
         + ", " + flightGroup.departureDateTime);
        for (let flightSegment of flightGroup.flightDetails) {
            console.log(tab + tab + flightSegment.origin + " to " + flightSegment.destination);
        }
    }
};

export const printProposalInformation = (proposal: Proposal) => {
    console.log(`Total Duration Minutes is ${proposal.totalDurationMinutes}`);
    const priceInToman = getProposalPriceInToman(proposal).toString();
    console.log(`Price in Toman: ${addCommaToPrice(priceInToman)} Toman`);
    printFlightSegments(proposal);
};

export const doesProposalPassUS = (proposal: Proposal, extra: any): boolean => {
    for (let flightGroup of proposal.flightGroups) {
        for (let flightDetail of flightGroup.flightDetails) {
            if (flightDetail.originCountryName.toLowerCase() === "united states" ||
                flightDetail.destinationCountryName.toLowerCase() == "united states") {
                return true;
            }
        }
    }
    return false;
};

const addCommaToPrice = (price: string): string => {
    const priceDigits = price.length;
    if (priceDigits <= 3){
        return price;
    } else {
        return addCommaToPrice(price.slice(0, priceDigits - 3)) + "," + price.slice(priceDigits - 3, priceDigits);
    }
};

//utils

const getAllDepartureDates = (proposal: Proposal) => {
    const departureTimes = [];
    for (let flightGroup of proposal.flightGroups) {
        departureTimes.push(flightGroup.departureDateTime);
    }
    return departureTimes;
};

const getTotalProposalLayOver = (proposal: Proposal) => {
    let sumLayOver = 0;
    for (let flightGroup of proposal.flightGroups) {
        sumLayOver += flightGroup.stopDurationTotal;
    }
    return sumLayOver;
};


const minutesToHoursMinutes = (minutes: number) => {
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const getProposalPriceInToman = (proposal: Proposal) => {
    // TODO: make sure [0] is a right thing to do
    return proposal.prices[0].perPassenger / 10;
};

const doesProposalHaveMoreThanOneStop = (proposal: Proposal, extra: any) => {
    for (let flightGroup of proposal.flightGroups) {
        if (flightGroup.numberOfStop > 1) {
            return true;
        }
    }
    return false;
};

const doesProposalNotPassSpecifiedStops = (proposal: Proposal, specifiedStops: any) => {
    for (let flightGroup of proposal.flightGroups) {
        for (let index = 0 ; index < flightGroup.flightDetails.length - 1 ; index++) {
            const flightSegment = flightGroup.flightDetails[index];
            if (!specifiedStops.includes(flightSegment.destination)) {
                return true;
            }
        }
    }
    return false;
};

const isProposalNotReservable = (proposal: Proposal, extra: any) => {
    return !proposal.isReservable;
};

const removeProposalWithCondition = (proposals: Proposal[], conditionFunc: (data: Proposal, extra: any) => boolean, extra: any = null) => {
    for (let index = proposals.length - 1; index >= 0 ; index--) {
        const proposal: Proposal = proposals[index];
        if (conditionFunc(proposal, extra)) {
            proposals.splice(index, 1);
        }
    }
};

const removeDuplicateProposals = (proposals: Proposal[]) => {
    const indexesToRemove = [];
    for (let index1 = proposals.length - 1; index1 >= 0; index1--) {
        const proposal1 = proposals[index1];
        for (let index2 = index1 - 1; index2 >= 0; index2--) {
            const proposal2 = proposals[index2];
            if (areProposalsEqual(proposal1, proposal2)) {
                indexesToRemove.push(index1);
            }
        }
    }
    for (let index1 = proposals.length - 1; index1 >= 0; index1--){
        if (indexesToRemove.includes(index1)){
            proposals.splice(index1, 1);
        }
    }
};

const filterProposals = (proposals: Proposal[]) => {
    removeProposalWithCondition(proposals, isProposalNotReservable);
    removeProposalWithCondition(proposals, doesProposalPassUS);
    removeProposalWithCondition(proposals, doesProposalHaveMoreThanOneStop);
    const specifiedStops = [IATA.FRA, IATA.YYZ, IATA.YUL]; //, IATA.YUL, IATA.YYZ
    removeProposalWithCondition(proposals, doesProposalNotPassSpecifiedStops, specifiedStops);
    removeDuplicateProposals(proposals);
};

const applyBiasSorting = (proposals: Proposal[]) => {
    proposals.sort((firstProposal: Proposal, secondProposal: Proposal) => {
        return getProposalPriceInToman(firstProposal) > getProposalPriceInToman(secondProposal) ||
            getTotalProposalLayOver(firstProposal) > getTotalProposalLayOver(secondProposal) ? 1 : -1;
    });
};

const areProposalsEqual = (proposal1: Proposal, proposal2: Proposal) => {
    return getProposalPriceInToman(proposal1) === getProposalPriceInToman(proposal2) &&
        proposal1.totalDurationMinutes === proposal2.totalDurationMinutes &&
        getTotalProposalLayOver(proposal1) === getTotalProposalLayOver(proposal2) &&
        getAllDepartureDates(proposal1).toString() === getAllDepartureDates(proposal2).toString();

};

export {filterProposals, applyBiasSorting};