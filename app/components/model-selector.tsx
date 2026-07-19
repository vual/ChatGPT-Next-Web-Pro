import Locale from "@/app/locales";
import { IconButton } from "@/app/components/button";
import { Avatar, Button, Card, List, Popover, Skeleton, Tabs } from "antd";

import styles from "./model-selector.module.scss";
import { useAllModels } from "@/app/utils/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { Modal } from "@/app/components/ui-lib";
import ConfirmIcon from "@/app/icons/confirm.svg";
import Meta from "antd/es/card/Meta";
import { useAccessStore } from "@/app/store";
import Search from "antd/es/input/Search";

import RobotIcon from "../icons/robot.svg";
import GptsIcon from "../icons/gpts.svg";
import { ServiceProvider } from "@/app/constant";

export function ModelSelector(props: {
  currentModel: string;
  updateCurrentModel: (
    model: string,
    displayName: string,
    avatar: string,
    providerName: string,
  ) => void;
  onClose: () => void;
}) {
  const [model, setModel] = useState<string>(props.currentModel.split("@")[0]);
  const [displayName, setDisplayName] = useState<string>("");
  const [avatar, setAvatar] = useState<string>("");
  const [providerName, setProviderName] = useState<string>(
    props.currentModel.split("@")[1],
  );
  const [searchName, setSearchName] = useState<string>("");
  const accessStore = useAccessStore();

  const select = (
    model: string,
    displayName: string,
    avatar: string,
    providerName: string,
    confirm: boolean,
  ) => {
    setModel(model);
    setDisplayName(displayName);
    setAvatar(avatar);
    setProviderName(providerName);
    if (confirm) {
      updateSessionModel();
    }
  };

  const updateSessionModel = () => {
    accessStore.update((access) => {
      if (!access.gpts.includes(model)) {
        access.gpts = access.gpts ? access.gpts + "," + model : model;
      }
    });
    props.updateCurrentModel(model, displayName, avatar, providerName);
    props.onClose();
  };

  const searchGpts = (value: string) => {
    setSearchName(value);
  };

  const [activeKey, setActiveKey] = useState<string>(
    accessStore.modelSelectorTabKey && !accessStore.hideGpts
      ? accessStore.modelSelectorTabKey
      : "1",
  );
  const updateActiveKey = (activeKey: string) => {
    setActiveKey(activeKey);
    accessStore.update((access) => {
      access.modelSelectorTabKey = activeKey;
    });
  };

  const searchTab = (
    <Search
      className={styles["gpts-search"]}
      placeholder={Locale.Chat.Model.SearchPlaceholder}
      onSearch={searchGpts}
      enterButton
      allowClear
    />
  );

  const items = [
    {
      key: "1",
      label: Locale.Chat.Model.Local,
      icon: <RobotIcon />,
      children: (
        <LocalModels
          model={model}
          providerName={providerName}
          select={select}
        />
      ),
    },
  ];

  if (!accessStore.hideGpts) {
    items.push({
      key: "2",
      label: Locale.Chat.Model.GPTs,
      icon: <GptsIcon />,
      children: (
        <GPTsModels
          model={model}
          providerName={providerName}
          select={select}
          searchName={searchName}
        />
      ),
    });
  }

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Chat.Model.Selector}
        className={styles["model-selector"]}
        onClose={() => props.onClose()}
        footer={
          <div className={styles["footer-selected-model"]}>{displayName}</div>
        }
        actions={[
          <IconButton
            key="comfirm"
            icon={<ConfirmIcon />}
            bordered
            text={Locale.Midjourney.Comfirm}
            type="primary"
            onClick={updateSessionModel}
          />,
        ]}
      >
        <div>
          <Tabs
            className={styles["model-selector-tabs"]}
            activeKey={activeKey}
            type="card"
            tabBarExtraContent={activeKey == "2" ? searchTab : null}
            onChange={(activeKey) => updateActiveKey(activeKey)}
            items={items}
          />
        </div>
      </Modal>
    </div>
  );
}

export function LocalModels(props: {
  model: string;
  providerName: string;
  select: (
    model: string,
    displayName: string,
    avatar: string,
    providerName: string,
    confirm: boolean,
  ) => void;
}) {
  let accessStore = useAccessStore();
  const allModels = useAllModels();
  const models = useMemo(() => {
    if (accessStore.chatAllThroughOpenai) {
      return allModels.filter(
        (m) => m.available && m.provider?.providerName.toLowerCase() != "azure",
      );
    } else {
      return allModels.filter((m) => m.available);
    }
  }, [allModels]);

  const providers = useMemo(() => {
    const names = models.map((m) => m.provider?.providerName ?? "");
    return names.filter((n, index) => names.indexOf(n) === index);
  }, [models]);

  const [activeKey, setActiveKey] = useState(
    props.providerName || providers[0],
  );
  const showModels = useMemo(() => {
    return models.filter((m) => m.provider?.providerName == activeKey);
  }, [models, activeKey]);

  return (
    <div>
      <Tabs
        activeKey={activeKey}
        items={providers.map((p: string) => ({ key: p, label: p }))}
        onChange={(value) => setActiveKey(value)}
      />
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 4,
        }}
        dataSource={showModels}
        renderItem={(item: any) => (
          <List.Item
            onClick={() => {
              props.select(
                item.name,
                item.displayName ? item.displayName : item.name,
                item.avatar ? item.avatar : "",
                item.provider.providerName,
                false,
              );
            }}
            onDoubleClick={() => {
              props.select(
                item.name,
                item.displayName ? item.displayName : item.name,
                item.avatar ? item.avatar : "",
                item.provider.providerName,
                true,
              );
            }}
          >
            <Card
              title={item.displayName ? item.displayName : item.name}
              bodyStyle={{ display: "none" }}
              className={
                props.model == item.name &&
                props.providerName == item.provider.providerName
                  ? styles["model-selected"]
                  : ""
              }
            ></Card>
          </List.Item>
        )}
      />
    </div>
  );
}

export function GPTsModels(props: {
  model: string;
  providerName: string;
  select: (
    model: string,
    displayName: string,
    avatar: string,
    providerName: string,
    confirm: boolean,
  ) => void;
  searchName: string;
}) {
  const [tags, setTags] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [list, setList] = useState<any>([]);
  const [dataIndex, setDataIndex] = useState<number>(0);
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(false);
  const accessStore = useAccessStore();

  const firstFetch = () => {
    fetch("https://gpts.ddaiai.com/open/gpts")
      .then((res) => res.json())
      .then((res) => {
        setTags(res.tag);
        setData(res.gpts);
        setList(res.gpts);
        setInitLoading(false);
      });
  };

  const onLoadMore = () => {
    setLoading(true);
    setList(data.concat([...new Array(4)].map(() => ({ loading: true }))));
    fetch("https://gpts.ddaiai.com/open/gptsapi/list/" + dataIndex)
      .then((res) => res.json())
      .then((res) => {
        const newData = data.concat(res.data.list);
        setData(newData);
        setList(newData);
        setLoading(false);
        setDataIndex(dataIndex + 24);
        // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
        // In real scene, you can using public method of react-virtualized:
        // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
        window.dispatchEvent(new Event("resize"));
      });
  };

  const loadMore =
    !initLoading && !loading && !search ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button onClick={onLoadMore}>loading more</Button>
      </div>
    ) : null;

  useEffect(() => {
    firstFetch();
  }, []);

  useEffect(() => {
    if (props.searchName) {
      setSearch(true);
      setList([...new Array(4)].map(() => ({ loading: true })));
      fetch(
        "https://gpts.ddaiai.com/open/gptsapi/search?q=" +
          encodeURI(props.searchName),
      )
        .then((res) => res.json())
        .then((res) => {
          setList(res.data.list);
          setLoading(false);
          window.dispatchEvent(new Event("resize"));
        });
    } else {
      setList(data);
      setSearch(false);
    }
  }, [props.searchName]);

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 4,
        lg: 4,
        xl: 4,
        xxl: 4,
      }}
      loading={initLoading}
      loadMore={loadMore}
      dataSource={list}
      renderItem={(item: any) => (
        <List.Item
          onClick={() => {
            props.select(
              item.gid,
              item.name,
              item.logo ? item.logo : "",
              ServiceProvider.OpenAI,
              false,
            );
          }}
          onDoubleClick={() => {
            props.select(
              item.gid,
              item.name,
              item.logo ? item.logo : "",
              ServiceProvider.OpenAI,
              true,
            );
          }}
        >
          <Skeleton avatar title={false} loading={item.loading} active>
            <Card
              headStyle={{ display: "none" }}
              bodyStyle={{ height: "140px", padding: "10px" }}
              className={
                props.model == item.gid ? styles["model-selected"] : ""
              }
            >
              <Popover title={item.name} content={item.info}>
                <Meta
                  avatar={<Avatar src={item.logo} />}
                  title={item.name}
                  description={item.info}
                  className={styles["model-card-mata"]}
                />
              </Popover>
            </Card>
          </Skeleton>
        </List.Item>
      )}
    />
  );
}
