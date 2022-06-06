import config from "../util/config.js"
import errorHandling from "../util/errorHandling.js"
import util from "../util/util.js"

export async function InitReport() {
  const dailyReport = document.querySelector('#daily-report .row')
  const weeklyReport = document.querySelector('#weekly-report')
  const monthlyReport = document.querySelector('#monthly-report')
  const annuallyReport = document.querySelector('#annually-report')
  const token = util.GetUserJWTToken()
  
  const reportFetch = await fetch(
    config.baseURL + '/usercart/statistics', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).then(response => errorHandling.HandlingFetchError(response))
    .then(response => response.json())
    .catch(error => errorHandling.PrintError(error))
  
  if (reportFetch.error != null) {
    errorHandling.HandlingFetchError(reportFetch.error.message)
    return
  }

  console.log(reportFetch);

  dailyReport.querySelector('.amount p').innerHTML = reportFetch.data.daily.amount
  dailyReport.querySelector('.qty p').innerHTML = reportFetch.data.daily.count

  weeklyReport.querySelector('.amount p').innerHTML = reportFetch.data.weekly.amount
  weeklyReport.querySelector('.qty p').innerHTML = reportFetch.data.weekly.count

  monthlyReport.querySelector('.amount p').innerHTML = reportFetch.data.monthly.amount
  monthlyReport.querySelector('.qty p').innerHTML = reportFetch.data.monthly.count

  annuallyReport.querySelector('.amount p').innerHTML = reportFetch.data.annually.amount
  annuallyReport.querySelector('.qty p').innerHTML = reportFetch.data.annually.count
}