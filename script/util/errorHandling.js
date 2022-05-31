const errorHandling = {
  PrintError: function (error) {
    console.warn(`ERROR: ${error}`);
    alert(`ERROR: ${error}`);
  },
  HandlingFetchError: function (response) {
    if (!response.ok) {
      throw Error({ "data": "i am not okay :(", "error": response.statusText })
    }
    return response
  }
}

export default errorHandling