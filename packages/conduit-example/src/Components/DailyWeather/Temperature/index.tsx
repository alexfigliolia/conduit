import { AriaHidden } from "@ui/Components/AriaHidden";

import "./styles.scss";

export const Temperature = ({
  value,
  resolved,
}: {
  value: number;
  resolved: boolean;
}) => {
  return (
    <div className="temp-value">
      {!resolved ? (
        <AriaHidden Tag="data">
          50<span>℉</span>
        </AriaHidden>
      ) : (
        <data value={value}>
          {value.toFixed(0)}
          <span>℉</span>
        </data>
      )}
    </div>
  );
};
