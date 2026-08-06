export interface KycPersonalInfoInput {
  fullName: string;
  dateOfBirth: string;
  country: string;
  addressLine1: string;
  city: string;
  postalCode: string;
}

export function personalInfoIsValid(info: KycPersonalInfoInput): boolean {
  return Boolean(
    info.fullName.trim() &&
      info.dateOfBirth &&
      info.country &&
      info.addressLine1.trim() &&
      info.city.trim() &&
      info.postalCode.trim()
  );
}
