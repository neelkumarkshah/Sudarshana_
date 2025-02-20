const func = async () => {
  try {
    const response = await window.versions.ping();
  } catch (error) {
    const response = error;
  }
};

func();

// const information = document.getElementById("info");
// information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;
