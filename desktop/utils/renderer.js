const func = async () => {
  try {
    const response = await window.versions.ping();
  } catch (error) {
    const response = error;
  }
};

func();
