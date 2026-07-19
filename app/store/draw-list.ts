import { StoreKey } from "@/app/constant";
import { createPersistStore } from "@/app/utils/store";

export type DrawItem = {
  sessionId: string;
  msgId: string;
  model: string;
  action: string;
  date: string;
  prompt: string;
  imgUrl: string;
  mj: {
    taskId: string;
    discordUrl: string;
  };
  sd: {
    info: string;
    parameters: {};
    html_info: string;
  };
};

export interface DrawListStore {
  items: DrawItem[];
  addItem: (item: DrawItem) => void;
  deleteItem: (index: number) => void;
}

export const useDrawListStore = createPersistStore(
  {
    items: [] as DrawItem[],
  },
  (set, get) => ({
    addItem(item: DrawItem) {
      set((state) => ({
        items: [item].concat(state.items),
      }));
    },

    deleteItem(index: number) {
      const items = get().items.slice();
      items.splice(index, 1);

      set(() => ({
        items: items,
      }));
    },
  }),
  {
    name: StoreKey.DrawList,
    version: 1.0,
    migrate(persistedState, version) {
      const state = persistedState as DrawListStore;

      return state as any;
    },
  },
);
