import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import type { Propless } from "@ui/Types";
import { JobListingsConduit } from "@ui/Conduits/jobListings";
import { Search } from "@ui/Components/Search";
import { ScreenReaderOnly } from "@ui/Components/ScreenReaderOnly";
import { Loader } from "@ui/Components/Loader";
import { Listbox } from "@ui/Components/Listbox";
import { useDebouncer } from "@figliolia/react-hooks";
import { useInfiniteConduit } from "@figliolia/conduit-react";
import { ConduitStatus } from "@figliolia/conduit";
import { useClassNames } from "@figliolia/classnames";

import { Job, type Props } from "./Job";

import "./styles.scss";

export const Jobs = memo(function (_: Propless) {
  const labelID = useId();
  const listBoxID = useId();
  const [search, setSearch] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const { status, value } = useInfiniteConduit(JobListingsConduit, {
    args: { search, cursor },
    skipWhen: !search,
  });

  const items = useMemo(
    () =>
      value.flatMap(
        page =>
          page?.data?.jobs?.map?.(item => ({ ...item, value: item.job_id })) ??
          [],
      ),
    [value],
  );

  const renderItem = useCallback((item: Props) => {
    return <Job {...item} />;
  }, []);

  const lastCursor = useMemo(
    () => value[value.length - 1]?.data?.cursor,
    [value],
  );

  const onScroll = useCallback(() => {
    if (
      !lastCursor ||
      lastCursor === cursor ||
      window.innerHeight + window.scrollY < document.body.scrollHeight - 100
    ) {
      return;
    }
    setCursor(lastCursor);
  }, [lastCursor, cursor]);

  const debouncer = useDebouncer(onScroll, 150);

  useEffect(() => {
    window.addEventListener("scroll", debouncer.execute);
    return () => window.removeEventListener("scroll", debouncer.execute);
  }, [debouncer]);

  const loaderClasses = useClassNames("job-loader", {
    visible: status === ConduitStatus.IN_FLIGHT,
  });

  return (
    <Fragment>
      <Search
        options={[]}
        status={status}
        className="job-search"
        onSearchQueryChange={setSearch}
        onSelectionChange={setSearch}
        renderEmptyState={() => null}
      />
      <Listbox
        items={items}
        className="job-list"
        containerID={listBoxID}
        aria-labelledby={labelID}
        renderItem={renderItem}
        scrollToNodeOnFocus
        renderEmptyState={() => null}
        label={
          <ScreenReaderOnly Tag="span" id={labelID}>
            List of Jobs Matching Your Search
          </ScreenReaderOnly>
        }
      />
      <Loader className={loaderClasses} />
    </Fragment>
  );
});
