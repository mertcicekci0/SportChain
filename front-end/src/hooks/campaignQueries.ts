import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { getApi, getStacksUrl } from "@/lib/stacks-api";
import { FUNDRAISING_CONTRACT } from "@/constants/contracts";
import { cvToJSON, hexToCV, cvToHex, principalCV } from "@stacks/transactions";
import { PriceData, satsToSbtc, ustxToStx } from "@/lib/currency-utils";

// Mock data for SportChain Youth Athlete Scholarship Platform
const MOCK_CAMPAIGN_DATA = {
  start: 1000, // Mock start block
  end: 5320, // Mock end block (4320 blocks duration)
  goal: 50000, // $50,000 USD goal
  totalStx: 15000000000, // 15,000 STX in microstacks (15,000 * 1,000,000)
  totalSbtc: 125000000, // 1.25 BTC in satoshis (1.25 * 100,000,000)
  donationCount: 127, // Number of donations
  isExpired: false,
  isWithdrawn: false,
  isCancelled: false,
};

const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || !FUNDRAISING_CONTRACT.address;

interface CampaignInfo {
  start: number;
  end: number;
  goal: number;
  totalStx: number;
  totalSbtc: number;
  usdValue: number;
  donationCount: number;
  isExpired: boolean;
  isWithdrawn: boolean;
  isCancelled: boolean;
}

export const useCampaignInfo = (
  currentPrices: PriceData | undefined
): UseQueryResult<CampaignInfo> => {
  const api = getApi(getStacksUrl()).smartContractsApi;

  return useQuery<CampaignInfo>({
    queryKey: ["campaignInfo"],
    queryFn: async () => {
      // Use mock data during development or when contract is not available
      if (USE_MOCK_DATA || !currentPrices?.stx || !currentPrices?.sbtc) {
        const totalStx = MOCK_CAMPAIGN_DATA.totalStx;
        const totalSbtc = MOCK_CAMPAIGN_DATA.totalSbtc;
        
        return {
          goal: MOCK_CAMPAIGN_DATA.goal,
          start: MOCK_CAMPAIGN_DATA.start,
          end: MOCK_CAMPAIGN_DATA.end,
          totalStx,
          totalSbtc,
          usdValue:
            Number(ustxToStx(totalStx)) * (currentPrices?.stx || 2.5) +
            satsToSbtc(totalSbtc) * (currentPrices?.sbtc || 95000),
          donationCount: MOCK_CAMPAIGN_DATA.donationCount,
          isExpired: MOCK_CAMPAIGN_DATA.isExpired,
          isWithdrawn: MOCK_CAMPAIGN_DATA.isWithdrawn,
          isCancelled: MOCK_CAMPAIGN_DATA.isCancelled,
        };
      }

      // Real blockchain call
      const response = await api.callReadOnlyFunction({
        contractAddress: FUNDRAISING_CONTRACT.address || "",
        contractName: FUNDRAISING_CONTRACT.name,
        functionName: "get-campaign-info",
        readOnlyFunctionArgs: {
          sender: FUNDRAISING_CONTRACT.address || "",
          arguments: [],
        },
      });
      if (response?.okay && response?.result) {
        const result = cvToJSON(hexToCV(response?.result || ""));
        if (result?.success) {
          const totalSbtc = parseInt(
            result?.value?.value?.totalSbtc?.value,
            10
          );
          const totalStx = parseInt(result?.value?.value?.totalStx?.value, 10);

          return {
            goal: parseInt(result?.value?.value?.goal?.value, 10),
            start: parseInt(result?.value?.value?.start?.value, 10),
            end: parseInt(result?.value?.value?.end?.value, 10),
            totalSbtc,
            totalStx,
            usdValue:
              Number(ustxToStx(totalStx)) * (currentPrices?.stx || 0) +
              satsToSbtc(totalSbtc) * (currentPrices?.sbtc || 0),
            donationCount: parseInt(
              result?.value?.value?.donationCount?.value,
              10
            ),
            isExpired: result?.value?.value?.isExpired?.value,
            isWithdrawn: result?.value?.value?.isWithdrawn?.value,
            isCancelled: result?.value?.value?.isCancelled?.value,
          };
        } else {
          throw new Error("Error fetching campaign info from blockchain");
        }
      } else {
        throw new Error(
          response?.cause || "Error fetching campaign info from blockchain"
        );
      }
    },
    refetchInterval: USE_MOCK_DATA ? 30000 : 10000, // Slower refresh for mock data
    retry: USE_MOCK_DATA ? false : 3, // No retry for mock data
    enabled: USE_MOCK_DATA || !!(currentPrices?.stx && currentPrices?.sbtc),
  });
};

interface CampaignDonation {
  stxAmount: number;
  sbtcAmount: number;
}

export const useExistingDonation = (
  address?: string | null | undefined
): UseQueryResult<CampaignDonation> => {
  const api = getApi(getStacksUrl()).smartContractsApi;
  return useQuery<CampaignDonation>({
    queryKey: ["campaignDonations", address],
    queryFn: async () => {
      if (!address) throw new Error("Address is required");

      // Use mock data during development
      if (USE_MOCK_DATA) {
        return {
          stxAmount: 2500000000, // 2,500 STX in microstacks
          sbtcAmount: 5000000,   // 0.05 BTC in satoshis
        };
      }

      const stxResponse = await api.callReadOnlyFunction({
        contractAddress: FUNDRAISING_CONTRACT.address || "",
        contractName: FUNDRAISING_CONTRACT.name,
        functionName: "get-stx-donation",
        readOnlyFunctionArgs: {
          sender: FUNDRAISING_CONTRACT.address || "",
          arguments: [cvToHex(principalCV(address))],
        },
      });

      const sbtcResponse = await api.callReadOnlyFunction({
        contractAddress: FUNDRAISING_CONTRACT.address || "",
        contractName: FUNDRAISING_CONTRACT.name,
        functionName: "get-sbtc-donation",
        readOnlyFunctionArgs: {
          sender: FUNDRAISING_CONTRACT.address || "",
          arguments: [cvToHex(principalCV(address))],
        },
      });

      if (stxResponse?.okay && sbtcResponse?.okay) {
        const stxResult = cvToJSON(hexToCV(stxResponse?.result || ""));
        const sbtcResult = cvToJSON(hexToCV(sbtcResponse?.result || ""));

        if (stxResult?.success && sbtcResult?.success) {
          return {
            stxAmount: parseInt(stxResult?.value?.value, 10),
            sbtcAmount: parseInt(sbtcResult?.value?.value, 10),
          };
        } else {
          throw new Error("Error fetching donation info from blockchain");
        }
      } else {
        throw new Error(
          stxResponse?.cause || sbtcResponse?.cause
            ? `${stxResponse?.cause}. ${sbtcResponse?.cause}`
            : "Error fetching donation info from blockchain"
        );
      }
    },
    enabled: !!address,
    refetchInterval: USE_MOCK_DATA ? 30000 : 10000, // Slower refresh for mock data
    retry: USE_MOCK_DATA ? false : 3, // No retry for mock data
  });
};
