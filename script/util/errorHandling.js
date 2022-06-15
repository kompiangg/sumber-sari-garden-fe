const errorHandling = {
  PrintError: function (error) {
    console.warn(`ERROR:`, error.message);
    alert(`ERROR: ` + error.message);
  },
  HandlingFetchError: function (response) {
    if (!response.ok) {
      throw Error({ "data": "i am not okay :(", "error": response.statusText })
    }
    return response
  }
}

export default errorHandling