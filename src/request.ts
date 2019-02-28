import {FlightClass, IATA, MultiCityRequest} from "./interfaces";
import {AlibabaApiUrl} from "./constants";
import AlibabaDate from "./date";
import Proposal from "./parser";
import {counter, servers} from "./index";
import {proxyConfig} from "./proxyConfig";
const request = require('request-promise-native');

const REQUEST_TIMEOUT = 100000;

class AlibabaRequest {
    public static counter = 0;
    constructor(private requestObject: MultiCityRequest) {

    }

    public async getFinalProposals(server: string): Promise<Proposal[]> {
        return new Promise(async (resolve, reject) => {
            let requestId: string = "";
            let localCounter = counter;
            try {
                while (requestId == "") {
                    try {
                        requestId = await this.getRequestId(server);
                        //requestId = await this.getIpAddress(server);
                    } catch (e) {
                        //console.log(e);
                        console.log(`catch ${server}`);
                        server = servers[localCounter++ % servers.length];
                    }
                }
                console.log(`requestId ${requestId} server: ${server}`);
                const now = new Date().getTime();
                //const oldCondition = (response.isCompleted == false || response.proposals.length == 0) && (new Date().getTime() - now < REQUEST_TIMEOUT);
                setTimeout(async () => {
                    let response = await this.getRequestResult(requestId, server);
                    let i = 1;
                    let max = 100;
                    while (i <= max) {
                        try {
                            setTimeout(async () => {
                                response = await this.getRequestResult(requestId, server);
                                if (response.proposals.length !== 0) {
                                    console.log('success');
                                    console.log(response.proposals.length);
                                    resolve(response.proposals);
                                } else {
                                    if (i == max) {
                                        // TODO: think how you can increase the number of iterations
                                    }
                                }
                            }, 2000 * i++);
                        } catch (e) {
                            //console.log(e);
                            console.log('in error')
                        }
                    }

                }, 90 * 1000);
                //console.log(new Date().getTime() - now);
                //console.log(response.isCompleted);
            } catch (error) {
                reject(error)
            }
        })
    }

    private getRequestResult(requestId: string, server: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const options = {
                json: true,
                method: 'GET',
                uri: AlibabaApiUrl.proposalRequest + requestId,
                headers: {
                    'Content-Type': 'application/json',
                    'cache-control': 'no-cache'
                },
                proxy: `http://${proxyConfig.username}:${proxyConfig.password}@${server}${proxyConfig.serverDomain}:${proxyConfig.port}`
            };
            AlibabaRequest.counter++;
            request(options).then((response: any) => {
                const result = response.result;
                resolve({proposals: result.proposals, isCompleted: result.isCompleted});
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    private getRequestId(server: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const options = {
                json: true,
                method: 'POST',
                uri: AlibabaApiUrl.proposalRequest,
                headers: {
                    'Content-Type': 'application/json',
                    'cache-control': 'no-cache'
                },
                timeout: REQUEST_TIMEOUT,
                body: this.requestObject,
                proxy: `http://${proxyConfig.username}:${proxyConfig.password}@${server}${proxyConfig.serverDomain}:${proxyConfig.port}`
            };
            request(options).then((response: any) => {
                const requestId = response.result.requestId;
                resolve(requestId);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public getIpAddress(server: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const options = {
                json: true,
                method: 'GET',
                uri: "http://ip-api.com/json",
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'cache-control': 'no-cache'
                },
                //body: this.requestObject,
                proxy: `http://${proxyConfig.username}:${proxyConfig.password}@${server}${proxyConfig.serverDomain}:${proxyConfig.port}`
            };
            request(options).then((response: any) => {
                //const requestId = response.result.requestId;
                resolve(response.query);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }

    public static sendRequest(url: string, server: string = null): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const options = {
                method: 'GET',
                uri: url,
                timeout: REQUEST_TIMEOUT,
                headers: {
                    'Content-Type': 'text/xml',
                    'cache-control': 'no-cache'
                },
            };
            request(options).then((response: any) => {
                //const requestId = response.result.requestId;
                resolve(response);
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
    public static getRequestObject(firstDate: AlibabaDate, secondDate: AlibabaDate, thirdDate: AlibabaDate = null, flightClass: FlightClass) {
        return {
            departureDate: firstDate,
            adult: 4,
            child: 0,
            infant: 0,
            flightClass: flightClass,
            isMultiCity: true,
            itineries: [
                {
                    Origin: IATA.IKA,
                    Destination: IATA.BCN,
                    DepartureDate: firstDate
                },
                {
                    Origin: IATA.BCN,
                    Destination: IATA.IKA,
                    DepartureDate: secondDate
                }
            ],
            returnDate: secondDate
        };
    }
}
export {REQUEST_TIMEOUT, AlibabaRequest};