import { EducationDegree } from "./updateUser.dto";

export interface AddEducationDto {
    institution: string;
    degree: EducationDegree;
    start_date: Date;
    end_date?: Date | null;
  }