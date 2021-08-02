module.exports = function geoCallback(flight) {
  return (err, res) => {
    if (err) {
      console.log(err);
      return;
    }

    const location = res[0];

    const { city, airport, locality, country, formatted_address } = location;

    if (city) {
      flight.custom.city = city;
    }

    if (airport) {
      flight.custom.airport = airport.short_name ?? airport.long_name;
    }

    if (locality) {
      flight.custom.locality = locality.short_name ?? locality.long_name;
    }

    if (country) {
      flight.custom.country = country.long_name ?? country.short_name;
    }

    if (formatted_address) {
      flight.custom.formatted_address = formatted_address;
    }

    const readableAddress = [flight.custom.airport, flight.custom.locality, flight.custom.country];

    flight.custom.readableAddress = readableAddress.filter(Boolean).join(', ');
  };
};
