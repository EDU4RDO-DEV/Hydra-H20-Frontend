export interface Permission {

  moduleId: number;
  viewModule: boolean;
  list: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
  export: boolean;
}

export interface GroupedPermission {

  group: string;
  modules: modulePermission[];
}

export interface modulePermission {
  moduleId: number;
  moduleName: string;
  group: string;
  viewModule: boolean;
  list: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
  export: boolean;
}
