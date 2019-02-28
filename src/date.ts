import * as moment from 'moment';
export default class AlibabaDate extends Date {

    constructor(private day: number, private month: number, private year: number) {
        super(year, month, day);
    }

    public toString(): string {
        let dayToString: string = "";
        let monthToString: string = "";
        if (this.day.toString().length == 1){
            dayToString = `0${this.day}`;
        }
        if (this.month.toString().length == 1){
            monthToString = `0${this.month}`;
        }
        return `${this.year}-${monthToString}-${dayToString}`;
    }

    public getAbsoluteDiffDays(date: AlibabaDate) {
        //Get 1 day in milliseconds
        var one_day = 1000 * 60 * 60 * 24;
        // Convert both dates to milliseconds
        var date1_ms = date.getTime();
        var thisDate_ms = this.getTime();
        // Calculate the difference in milliseconds
        var difference_ms = Math.abs(thisDate_ms - date1_ms);
        // Convert back to days and return
        console.log(difference_ms % one_day);
        return Math.round(difference_ms / one_day);
    }

    public getDay(): number {
        return this.day;
    }
}