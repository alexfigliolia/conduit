import { useState } from "react";
import { Question } from "@ui/UIIcons/Question";
import { LocationFilled } from "@ui/UIIcons/Location";
import type { ListBoxItem, ListBoxValueID } from "@ui/Components/Listbox";
import { GlassContainer } from "@ui/Components/GlassContainer";
import type { JobListing } from "@ui/API";
import { useMount } from "@figliolia/react-hooks";
import { useClassNames } from "@figliolia/classnames";

import "./styles.scss";

export const Job = ({ item, focused, selected }: Props) => {
  const [fadeIn, setFadeIn] = useState(false);

  useMount(() => {
    setFadeIn(true);
  });

  const classes = useClassNames("job-listing", {
    focused,
    selected,
    "fade-in": fadeIn,
  });
  return (
    <GlassContainer Tag="article" className={classes}>
      <div className="job-listing__title">
        {item.employer_logo ? <img src={item.employer_logo} /> : <Question />}
        <div className="job-listing__title-meta">
          {item.employer_website ? (
            <a href={item.employer_website} target="blank">
              <span>{item.job_title}</span>
            </a>
          ) : (
            <span>{item.job_title}</span>
          )}
          {(item.job_city || item.job_state || item.job_country) && (
            <div className="job-listing__location">
              <LocationFilled />
              <span>
                {item.job_city && `${item.job_city}, `}
                {item.job_state && `${item.job_state}, `}
                {item.job_country}
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassContainer>
  );
};

export type Props = ListBoxItem<JobListing & { value: ListBoxValueID }>;
