# AlibabaTicketFinder

This is a script written in Typescript for those who wants
to find a flight:
#####Given departure dates(each as an interval) and airport IATA codes, 
This small project can find the best flights which 
layover time and price are minimized.
It queries Alibaba Website's (https://www.alibaba.ir) endpoint 
 with more than 100 date combinations at the same time. It filters all the flights 
 having connections to US (since not all the Iranian People can get a Visa or are a dual-citizen)
 and also removes all flights with two stops on the way so that it will show you the most comfortable
 flights available. It also does bias-sorting on the remaining flights at the end.