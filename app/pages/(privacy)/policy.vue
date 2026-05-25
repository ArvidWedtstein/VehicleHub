<script setup lang="ts">
definePageMeta({
  auth: false,
});
useHead({
  title: "Privacy Policy",
});
</script>
<template>
  <UContainer>
    <UPage>
      <UPageSection
        title="Privacy Policy"
        description="Last updated: 25.05.2026"
      />

      <UPageBody>
        <UPageFeature title="Who We Are and How to Contact Us">
          <template #leading>
            <UAvatar text="1" />
          </template>
          <template #description>
            <p>
              This Privacy Policy applies to Vehicle App, a vehicle management
              application.
            </p>
            <p>
              For any questions or concerns regarding this Privacy Policy,
              please contact me at:
            </p>
            <ul class="list-disc list-inside">
              <li>Email: spamarvid0310@gmail.com</li>
            </ul>
          </template>
        </UPageFeature>
        <UPageFeature title="What Personal Data Do We Collect">
          <template #leading>
            <UAvatar text="2" />
          </template>
          <template #description>
            <p>
              We collect the following types of personal data from our users:
            </p>
            <ol class="list-decimal list-inside">
              <li>
                <strong>Contact Information:</strong> This includes your name,
                email address, profile photo and any other information you
                provide when you create an account or contact us.
              </li>
              <li>
                <strong>Device Information:</strong> We may collect information
                about the device you use to access our website, such as your IP
                address, browser type, and operating system.
              </li>
              <li>
                <strong>Data you choose to provide:</strong> Vehicle
                Identification Number (VIN) and other vehicle information that
                you choose to provide when using our services. This information
                is used to provide you with accurate and personalized vehicle
                data and services.
              </li>
              <li>
                <strong>Cookies and Tracking Technologies:</strong> We use
                cookies to enhance your experience on our website and to collect
                information about your browsing behavior.
              </li>
            </ol>
          </template>
        </UPageFeature>
        <UPageFeature title="Why We Process Your Data (Legal Basis)">
          <template #leading>
            <UAvatar text="3" />
          </template>
          <template #description>
            <p>
              We process your personal data on the following legal bases under
              the General Data Protection Regulation (GDPR):
            </p>
            <ol class="list-disc">
              <li>
                Name (from Google Sign-In): Performance of a contract - We
                process your name to create and manage your account, provide
                personalized services, and communicate with you about your
                account and our services.
              </li>
              <li>
                Vehicle data (VIN / license plate): Consent - you voluntarily
                provide this data to use specific features of the App. You may
                delete this data at any time, which may limit your use of
                certain features.
              </li>
            </ol>
          </template>
        </UPageFeature>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
