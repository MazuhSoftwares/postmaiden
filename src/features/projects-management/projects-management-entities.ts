export type ProjectListing = {
  items: ProjectListingItem[];
};

export interface ProjectListingItem {
  uuid: string;
  name: string;
}
