import { Rows, FormField, Button, Slider } from "@canva/app-ui-kit";
import * as React from "react";
import styles from "styles/components.css";
import { appProcess } from "@canva/preview/platform";
import { useOverlay } from "utils/use_overlay_hook";
import { useSelection } from "utils/use_selection_hook";
import { getTemporaryUrl } from "@canva/asset";
import { LaunchParams } from "./app";

type UIState = {
  brushSize: number;
};
const initialState: UIState = {
  brushSize: 7,
};

export const ObjectPanel = () => {
  const {
    canOpen,
    isOpen,
    open,
    close: closeOverlay,
  } = useOverlay("image_selection");
  const selection = useSelection("image");
  const [state, setState] = React.useState<UIState>(initialState);

  const openOverlay = async () => {
    const draft = await selection.read();
    if (draft.contents.length !== 1) {
      return;
    }
    const { url } = await getTemporaryUrl({
      type: "IMAGE",
      ref: draft.contents[0].ref,
    });

    open({
      launchParameters: {
        brushSize: state.brushSize,
        selectedImageUrl: url,
      } satisfies LaunchParams,
    });
  };

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        {isOpen ? (
          <>
            <FormField
              label="Brush size"
              value={state.brushSize}
              control={(props) => (
                <Slider
                  {...props}
                  defaultValue={initialState.brushSize}
                  min={5}
                  max={20}
                  step={1}
                  value={state.brushSize}
                  onChange={(value) =>
                    setState((prevState) => {
                      return {
                        ...prevState,
                        brushSize: value,
                      };
                    })
                  }
                  onChangeComplete={(_, value) =>
                    appProcess.broadcastMessage({
                      ...state,
                      brushSize: value,
                    })
                  }
                />
              )}
            />
            <Button
              variant="primary"
              onClick={() => closeOverlay({ reason: "completed" })}
              stretch
            >
              Save Overlay
            </Button>
            <Button
              variant="primary"
              onClick={() => closeOverlay({ reason: "aborted" })}
              stretch
            >
              Cancel Overlay
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={openOverlay}
              disabled={!canOpen}
              stretch
            >
              Open Overlay
            </Button>
          </>
        )}
      </Rows>
    </div>
  );
};
