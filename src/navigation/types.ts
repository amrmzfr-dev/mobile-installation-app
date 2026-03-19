export type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
  Main: undefined;
  JobDetail: { jobId: string };
  HomeSurveyForm: { jobId: string };
  InstallationForm: { jobId: string };
  InvoiceDetail: { invoiceId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Billing: undefined;
  Profile: undefined;
};
