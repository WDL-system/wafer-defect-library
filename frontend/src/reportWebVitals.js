const reportWebVitals = onPerfEntry => {
  if (typeof onPerfEntry === 'function') {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      })
      .catch(error => {
        console.error('Failed to load web-vitals', error);
        //  You could also choose to notify the user or an error tracking service.
      });
  }
};

export default reportWebVitals;