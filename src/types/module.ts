export interface ModuleDto {
  id: number;
  name: string;
  group: string;
  registrationDate: string;
  canceled: boolean;
  cancelUserId: number | null;
  cancelDate: string | null;
  modifyUserId: number | null;
  modifyDate: string | null;
}

export interface CreateModuleDto {
  name: string;
  group: string;
  registrationUserId: number;
}

export interface UpdateModuleDto {
  id: number;
  name: string;
  group: string;
  modifyUserId: number;
}

export interface PagedModulesResponse {
  data: ModuleDto[];
  totalCount: number;
}