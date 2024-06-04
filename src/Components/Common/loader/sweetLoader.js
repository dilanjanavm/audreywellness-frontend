import "./styleLoader.css";
import { useSelector } from "react-redux";

const SweetLoader = () => {
  const isLoading = useSelector((state) => state?.loader?.isLoader);
  // console.log(isLoading, "++++++++++++++++++++++++");

  var documentScrollHeight = Math.max(
    document.documentElement.scrollHeight,
    document.body.scrollHeight
  );
  const bodyLoaderStyle = {
    height: `${documentScrollHeight}px`,
    zIndex: 999999999,
  };
  return (
    <>
      {isLoading && (
        <section className={"main-Container"}>
          <section className={"body_loader"} style={bodyLoaderStyle}>
            <div className={"loader-parent"}>
              {/* <div
                style={{ display: isLoading ? "block" : "none" }}
                className="loader"
              >
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
                <div className="circle"></div>
              </div> */}
              <div class="loadingspinner">
              <div id="square1"></div>
              <div id="square2"></div>
              <div id="square3"></div>
              <div id="square4"></div>
              <div id="square5"></div>
            </div>
            </div>
            
          </section>
        </section>
      )}
    </>
  );
};
export default SweetLoader;
