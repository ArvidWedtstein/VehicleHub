<script setup lang="ts">
definePageMeta({
  auth: false,
});
useHead({
  title: "Terms of Service",
});
</script>
<template>
  <UContainer>
    <UPage>
      <UPageSection
        title="Terms of Service"
        description="Last updated: 25.05.2026"
      />

      <UPageBody>
        <UPageFeature title="Acceptance of Terms">
          <template #leading>
            <UAvatar text="1" />
          </template>
          <template #description>
            <p>
              By accessing or using Vehicle App, you agree to be bound by these
              Terms of Service and our Privacy Policy. If you do not agree to
              these terms, please do not use our services.
            </p>
            <p>
              We reserve the right to update or modify these Terms of Service at
              any time without prior notice. Your continued use of the services
              after any such changes constitutes your acceptance of the new
              Terms of Service.
            </p>
          </template>
        </UPageFeature>
        <UPageFeature title="Description of Service">
          <template #leading>
            <UAvatar text="2" />
          </template>
          <template #description>
            <p>
              The App is a personal vehicle management application that allows
              you to store and manage information about your vehicles, including
              maintenance records, fuel logs, and other relevant data. The App
              is intended for personal use and is not designed for commercial or
              fleet management purposes. The App is provided "as is" without any
              warranties of any kind, either express or implied. We do not
              guarantee the accuracy, completeness, or reliability of the
              information stored in the App, and we are not responsible for any
              errors or omissions in the data.
            </p>
          </template>
        </UPageFeature>
        <UPageFeature title="Your Account">
          <template #leading>
            <UAvatar text="3" />
          </template>
          <template #description>
            <p>
              To use the App, you must sign in using a Google account. You are
              responsible for:
            </p>
            <ul class="list-disc list-inside">
              <li>
                Maintaining the security and confidentiality of your account
                credentials
              </li>
              <li>All activity that occurs under your account.</li>
              <li>
                Ensuring that any information you enter into the App is
                accurate.
              </li>
            </ul>
            <p>
              We reserve the right to suspend or terminate the App or your
              account at any time if we believe that you are misusing the App or
              violating these Terms.
            </p>
          </template>
        </UPageFeature>
        <UPageFeature title="Your Data">
          <template #leading>
            <UAvatar text="4" />
          </template>
          <template #description>
            <p>
              You retain ownership of all data you enter into the App. By
              entering data into the App, you grant us a non-exclusive,
              worldwide, royalty-free license to use, copy, modify, and display
              that data solely for the purpose of providing the service to you.
            </p>
            <p>
              You are solely responsible for the accuracy pof the data you enter
              into the App. We do not verify or validate any data.
            </p>
          </template>
        </UPageFeature>
        <UPageFeature title="Acceptable Use">
          <template #leading>
            <UAvatar text="5" />
          </template>
          <template #description>
            <p>You agree not to use the App to:</p>
            <ul class="list-disc list-inside">
              <li>
                Store or transmit any data you do not have the right to use.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the App or
                its infrastructure.
              </li>
              <li>
                Use the App for any unlawful purpose or in violation of any
                applicable laws or regulations.
              </li>
              <li>Reverse engineer, decompile, or disassemble the App.</li>
            </ul>
          </template>
        </UPageFeature>
        <UPageFeature title="Disclaimer of Warranties">
          <template #leading>
            <UAvatar text="6" />
          </template>
          <template #description>
            <p>
              The App is provided "as is" without warranties of any kind, either
              express or implied. To the fullest extent permitted by law, we
              disclaim all warranties, including but not limited to:
            </p>
            <ul class="list-disc list-inside">
              <li>
                That the App will be uninterrupted, secure, or error-free.
              </li>
              <li>
                That any data stored in the App will be free from loss or
                corruption.
              </li>
              <li>That the App will meet your requirements.</li>
            </ul>
            <p>You use the App at your own risk.</p>
          </template>
        </UPageFeature>
        <UPageFeature title="Limitation of Liability">
          <template #leading>
            <UAvatar text="7" />
          </template>
          <template #description>
            <p>
              To the maximum extent permitted by applicable law, we shall not be
              liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to:
            </p>
            <ul class="list-disc list-inside">
              <li>Loss of data or vehicle information.</li>
              <li>Loss of access to the App.</li>
              <li>
                Any reliance you place on the information stored in the App.
              </li>
            </ul>
          </template>
        </UPageFeature>
        <UPageFeature title="Service Availability and Changes">
          <template #leading>
            <UAvatar text="8" />
          </template>
          <template #description>
            <p>
              We do not guarantee that the App will be available at all times.
              We may:
            </p>
            <ul class="list-disc list-inside">
              <li>
                Suspend or discontinue the App at any time, with or without
                notice.
              </li>
              <li>
                Modify, update, or remove features of the App at any time.
              </li>
              <li>
                Delete inactive accounts or data after a prolonged period of
                inactivity.
              </li>
            </ul>
          </template>
        </UPageFeature>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
